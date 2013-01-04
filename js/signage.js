function Signage(options)
{
    var options                   = options || {},
        step                      = options.step || 2, // stepsize in font points for auto-adjustment on writing
        tolerance                 = options.tolerance || 5, // percentage of max limit that text area should be wihin
        boxes                     = [],
        font_startsize            = options.font_startsize || 100,
        fonts                     = [],
        doc_width                 = options.doc_width || null,
        doc_height                = options.doc_height || null,
        max_width_percentage      = options.max_width_percentage || 85,
        max_height_percentage     = options.max_height_percentage || 70,
        min_width_workarea        = options.min_width_workarea || 1250,
        width_height_relationship = options.width_height_relationship || 1.55,
        max_text_width,
        max_text_height,
        old_color,
        canvas,
        timeout,
        color_timeout,
        current_textbox,
        print_window;

    /**
     * initializes the width and height parameters
     *
     * @return void
     */
    function determineWorkArea()
    {
        if (!doc_width) {
            doc_width  = window.innerWidth >= min_width_workarea ? window.innerWidth - 30 : min_width_workarea;
            doc_height = Math.round(doc_width / width_height_relationship);
        }

        max_text_width  = doc_width * max_width_percentage / 100;
        max_text_height = doc_height * max_height_percentage / 100;

        if (doc_height > window.innerHeight && options.fit_screen) {
            doc_width       = Math.round(doc_width * (window.innerHeight / doc_height));
            doc_height      = window.innerHeight;
            max_text_width  = doc_width * max_width_percentage / 100;
            max_text_height = doc_height * max_height_percentage / 100;
        }
    }

    /**
     * base object for canvas interaction
     *
     * @return void
     */
    function CanvasObject()
    {
        this.super = this;
    }

    /**
     * class used for text boxes
     * drawn on the canvas
     *
     * @param Canvas canvas Canvs instance from the fabric.js library
     *
     * @return object
     */
    function CanvasTextbox(canvas, container)
    {
        var canvas_text;

        if (!(this instanceof CanvasTextbox)) {
            return new CanvasTextbox(canvas, container);
        }

        /**
         * returns the container the textbox is
         * tied to
         *
         * @return object
         */
        this.getContainer = function()
        {
            return container;
        }

        /**
         * returns the canvas text element of the instance
         *
         * @return fabric.Text
         */
        this.getCanvasObject = function()
        {
            return canvas_text;
        }

        this.index                  = boxes.length + 1;
        this.fontsize               = font_startsize;
        this.font_input             = container.find('input.font-size');
        container[0].canvas_element = this;

        canvas_text = new fabric.Text(container.find('textarea').val(), {
            fontSize: font_startsize,
            textAlign: 'center',
        });

        if (fonts && fonts[0]) {
            canvas_text.fontFamily = fonts[0];
        }

        boxes.push(this);

        for (var i = 0, length = boxes.length; i < length; ++i) {
            boxes[i].resetBoundingBox();
        }

        canvas.add(canvas_text);
        window.setTimeout(function() {
            canvas.renderAll()
        }, 1000);
    }

    /**
     * class used for images
     * drawn on the canvas
     *
     * @param Canvas canvas     Canvas instance from the fabric.js library
     * @param object container  jQuery set container the dom element to tie image to
     * @param string image_path Path of image to add
     *
     * @return object
     */
    function CanvasImage(canvas, container, image_path)
    {
        var canvas_image,
            self;

        if (!(this instanceof CanvasImage)) {
            return new CanvasImage(canvas, container);
        }

        self = this;

        /**
         * returns the container the textbox is
         * tied to
         *
         * @return object
         */
        this.getContainer = function()
        {
            return container;
        }

        /**
         * returns the canvas text element of the instance
         *
         * @return fabric.Text
         */
        this.getCanvasObject = function()
        {
            return canvas_image;
        }

        this.index                  = boxes.length + 1;
        this.scale_input            = container.find('input.scale');
        container[0].canvas_element = this;

        canvas_image = fabric.Image.fromURL(image_path, function(image) {
            canvas_image = image;

            boxes.push(self);

            for (var i = 0, length = boxes.length; i < length; ++i) {
                boxes[i].resetBoundingBox();
            }

            canvas.add(canvas_image);
            window.setTimeout(function() {
                canvas.renderAll()
            }, 1000);
        });
    }

    /**
     * removes the box
     *
     * @return void
     */
    CanvasObject.prototype.remove = function ()
    {
        boxes.splice(this.index - 1, 1);

        this.getCanvasObject().remove();

        for (var i = 0, length = boxes.length; i < length; i++) {
            boxes[i].index = i + 1;
            boxes[i].resetBoundingBox();
        }

        canvas.renderAll();
    }

    /**
     * sets/resets the bounding box for the
     * textbox, possibly repositioning it
     *
     * @return this
     */
    CanvasObject.prototype.resetBoundingBox = function()
    {
        var box_count = boxes.length;

        this.max_height = max_text_height / box_count;
        this.max_width  = max_text_width;

        this.upper_limit = (doc_height - max_text_height) / 2 + (this.max_height * (this.index - 1));
        this.lower_limit = this.upper_limit + this.max_height;
        this.left_limit  = (doc_width - max_text_width) / 2;
        this.right_limit = this.left_limit + this.max_width;

        this.getCanvasObject().set({top: this.upper_limit + this.max_height / 2, left: this.left_limit + this.max_width / 2});

        return this;
    }

    /**
     * checks if the text painted is outside its bounding box
     *
     * @return bool
     */
    CanvasObject.prototype.isObjectInsideMax = function()
    {
        return this.getCanvasObject().getWidth() < this.max_width && this.getCanvasObject().getHeight() < this.max_height;
    }

    CanvasTextbox.prototype = new CanvasObject();
    CanvasImage.prototype   = new CanvasObject();

    CanvasTextbox.prototype.parent = CanvasObject.prototype;
    CanvasImage.prototype.parent   = CanvasObject.prototype;

    CanvasTextbox.prototype.constructor = CanvasTextbox;
    CanvasImage.prototype.constructor   = CanvasImage;

    /**
     * sets/resets the bounding box for the
     * textbox, possibly repositioning it
     *
     * @return this
     */
    CanvasTextbox.prototype.resetBoundingBox = function()
    {
        this.parent.resetBoundingBox.call(this);

        this.resizeText();

        return this;
    }

    /**
     * sets/resets the bounding box for the
     * image, possibly repositioning it
     *
     * @return this
     */
    CanvasImage.prototype.resetBoundingBox = function()
    {
        this.parent.resetBoundingBox.call(this);

        this.resizeImage();

        return this;
    };

    /**
     * checks if an image is too big
     * for it's containing box and scales
     * it down as needed
     *
     * @return this
     */
    CanvasImage.prototype.resizeImage = function ()
    {
        var current_width,
            current_height,
            current_scale = this.scale_input.val() / 100,
            x_scale       = current_scale,
            y_scale       = current_scale;

        if (!this.isObjectInsideMax()) {
            current_width  = this.getCanvasObject().getWidth();
            current_height = this.getCanvasObject().getHeight();

            if (current_width > this.max_width) {
                x_scale = current_scale * this.max_width / current_width;
            }

            if (current_height > this.max_height) {
                y_scale = current_scale * this.max_height / current_height;
            }

            this.getCanvasObject().scale(x_scale > y_scale ? y_scale : x_scale);
            this.scale_input.val(Math.round((x_scale > y_scale ? y_scale : x_scale) * 100));
        }
    };

    /**
     * Changes the color of the text
     *
     * @param string color New color for the text
     *
     * @return this
     */
    CanvasTextbox.prototype.setColor = function (color)
    {
        this.getCanvasObject().setColor(color);
        canvas.renderAll();

        return this;
    }

    /**
     * resizes the text of the textbox
     * to fit inside the box's area
     *
     * @return this
     */
    CanvasTextbox.prototype.resizeText = function()
    {
        var modifier,
            limit = 20,
            self  = this;

        if (!this.isTextWithinTolerance()) {

            modifier = step * (this.getCanvasObject().getWidth() > this.max_width || this.getCanvasObject().getHeight() > this.max_height ? -1 : 1);

            while (!this.isTextWithinTolerance() && limit) {
                this.fontsize += modifier;
                this.getCanvasObject().setFontsize(this.fontsize);
                limit--;
            }

            this.font_input.val(this.fontsize);

            if (!limit) {
                window.setTimeout(function() {
                    self.resizeText();
                    canvas.renderAll();
                }, 0);
            }
        }

        return this;
    }

    /**
     * updates the text of a textbox
     *
     * @param string text New text to set for textbox
     *
     * @return this
     */
    CanvasTextbox.prototype.changeText = function (text)
    {
        this.getCanvasObject().setText(text);
        this.resizeText();

        canvas.renderAll();

        return this;
    }

    /**
     * checks if the text painted is currently within the tolerance zone
     *
     * @return bool
     */
    CanvasTextbox.prototype.isTextWithinTolerance = function()
    {
        var text_width  = this.getCanvasObject().getWidth(),
            text_height = this.getCanvasObject().getHeight(),
            returnval;

        return this.isObjectInsideMax()
            && (Math.abs(text_width - this.max_width) < this.max_width * tolerance / 100
                || Math.abs(text_height - this.max_height) < this.max_height * tolerance / 100);
    }

    /**
     * override the automatically found font size
     *
     * @param string fontsize Fontsize to use
     *
     * @return this
     */
    CanvasTextbox.prototype.setFontSize = function(fontsize)
    {
        var size     = parseInt(fontsize, 10),
            old_size = this.fontsize;

        this.fontsize = size;
        this.getCanvasObject().setFontsize(this.fontsize);

        if (!this.isObjectInsideMax()) {
            this.fontsize = old_size;
            this.getCanvasObject().setFontsize(old_size);
            this.font_input.val(this.fontsize);
        }

        canvas.renderAll();

        return this;
    }

    /**
     * changes the textbox to another font
     *
     * @param string font_family Name of font to switch to
     *
     * @return this
     */
    CanvasTextbox.prototype.changeFont = function(font_family)
    {
        this.getCanvasObject().fontFamily = font_family;
        canvas.renderAll();

        return this;
    }

    /**
     * changes the alignment of the text box
     *
     * @param string alignment New text alignment, one of left, center or right
     *
     * @return this
     */
    CanvasTextbox.prototype.changeAlignment = function(alignment)
    {
        this.getCanvasObject().textAlign = alignment;
        canvas.renderAll();

        return this;
    };

    /**
     * changes the scale of the icon
     *
     * @param int scale New scale of icon in percent
     *
     * @return this
     */
    CanvasImage.prototype.setScale = function(scale)
    {
        var fixed_scale = parseInt(scale, 10);
        if (fixed_scale < 0) {
            fixed_scale = 0;
            this.scale_input.val(0);

        } else {
            fixed_scale /= 100;
        }

        this.getCanvasObject().scale(fixed_scale);
        this.resizeImage();

        canvas.renderAll();

        return this;
    };

    /**
     * sets up the canvas object
     *
     * @return void
     */
    function setupCanvas()
    {
        canvas = new fabric.StaticCanvas('container');
        canvas.setHeight(doc_height)
            .setWidth(doc_width)
            .setBackgroundImage(backgrounds[0]);

        new CanvasTextbox(canvas, $('div.contentbox'));
    }

    /**
     * creates and initializes a background selector
     *
     * @return void
     */
    function setupBackgroundSelector()
    {
        var select = $('<select></select>');

        for (var i = 0, length = backgrounds.length; i < length; ++i) {
            select.append('<option value="' + backgrounds[i] + '">' + backgrounds[i].replace(/\/backgrounds\//, '') + '</option>');
        }

        $('p.background').append(select);

        select.on('change', function() {
            canvas.setBackgroundImage(select.val());
            canvas.renderAll();
            window.setTimeout(function() {
                canvas.renderAll();
            }, 1000);
        });
    }

    /**
     * creates and initializes a font selector
     *
     * @return void
     */
    function setupFontSelector()
    {
        var select = $('<select></select>');

        $('div.fonts span').each(function(idx, item) {
            fonts.push($(item).data('font'));
        });

        for (var i = 0, length = fonts.length; i < length; ++i) {
            select.append('<option value="' + fonts[i] + '">' + fonts[i] + '</option>');
        }

        $('p.font').append(select);
    }

    /**
     * runs when user clicks in the control panel
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function handleControllerClick(e)
    {
        var self      = $(e.target),
            classname;

        e.preventDefault();
        e.stopPropagation();

        $('#text-color-picker').hide();
        current_textbox = null;

        if (e.target.nodeName == 'INPUT') {
            old_color       = self.val();
            current_textbox = getCanvasElement(self);
            classname       = self.attr('class') + '-picker';

            $('#' + classname).show();
        }
    }

    /**
     * runs when the user types text into the textarea
     *
     * @param Event e Key event triggered
     *
     * @return void
     */
    function handleTextChange(e)
    {
        var self    = $(this),
            textbox = getCanvasElement(self);

        if (timeout) {
            window.clearTimeout(timeout);
        }


        timeout = window.setTimeout(function() {
            timeout = null;
            textbox.changeText(self.val());
        }, 300);
    }

    /**
     * returns the canvas textbox related to a given container
     *
     * @param Object element jQuery set containing a descendant of a textbox container
     *
     * @return CanvasTextbox
     */
    function getCanvasElement(element)
    {
        var container = element.closest('div.contentbox');

        if (!container[0].canvas_element) {
            throw new Error('Textbox not found');
        }

        return container[0].canvas_element;
    }

    /**
     * runs after user has chosen new color for text
     *
     * @param string color New color chosen
     *
     * @return void
     */
    function handleTextColorChange(color)
    {
        if (current_textbox) {
            current_textbox.getContainer().find('input.text-color').css('background-color', color).val(color);
            current_textbox.setColor(color);
        }
    }

    /**
     * runs when the user clicks on one of
     * the text alignment radio buttons
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function handleAlignmentClick(e)
    {
        var self    = $(this),
            textbox = getCanvasElement(self);

        textbox.changeAlignment(self.val());
    }

    /**
     * runs when the user changes the font size
     *
     * @param Event e Change event triggered
     *
     * @return void
     */
    function handleFontSizeChange(e)
    {
        var self    = $(this),
            textbox = getCanvasElement(self);

        textbox.setFontSize(self.val());
    }

    /**
     * opens/closes the advanced settings
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function toggleAdvancedSettings(e)
    {
        var self = $(this);

        self.parent().find('div.settings').animate({height: 'toggle'});
    }

    /**
     * handles exporting the canvas to an image
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function handlePrint(e)
    {
        var window_loading = false;
        function addElement(print_window)
        {
            $(print_window.document).find('body').html('<img alt="" src="' + canvas.toDataURL('png', 1) + '"/>');
        }

        if (!print_window || print_window.closed) {
            print_window = null;
            print_window = window.open('/print.html', 'printing');

            window_loading = true;
        }

        if (window_loading) {
            print_window.onload = function() {
                addElement(print_window);
            };
        } else {
            addElement(print_window);
        }
    }

    /**
     * adds a textbox clone after button trigger
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function addTextBox()
    {
        var original   = $('div.contentbox').first(),
            last       = $('div.contentbox').last(),
            text_color,
            clone;

        clone = $('<div class="contentbox">' + original.html() + '</div>').insertAfter(last);
        clone.find('button.add-textbox').removeClass('add-textbox').addClass('remove-box').text('-');
        clone.find('div.settings').hide();
        text_color = clone.find('input.text-color');
        text_color.css('background-color', text_color.val());
        new CanvasTextbox(canvas, clone);
    }

    /**
     * function docblock
     *
     * @param
     *
     * @return void
     */
    function removeBox()
    {
        var container = $(this).closest('div.contentbox'),
            box       = getCanvasElement($(this));

        box.remove();

        container.remove();
    }

    /**
     * triggers when a user changes the color of the
     * text via the input field and not the color picker
     *
     * @param Event e Change event triggered
     *
     * @return void
     */
    function handleManualTextColorChange(e)
    {
        var new_color = $(this).val();

        if (color_timeout) {
            window.clearTimeout(color_timeout);
        }

        if (new_color.length == 7 && new_color != old_color) {
            window.setTimeout(function() {
                old_color = new_color;
                $.farbtastic('#text-color-picker').setColor(new_color);
                handleTextColorChange(new_color);
            }, 300);
        }
    }

    /**
     * triggered on font changes for textbox
     *
     * @param Event e Change event triggered
     *
     * @return void
     */
    function handleFontChange(e)
    {
        var self      = $(this),
            textbox   = getCanvasElement(self);

        textbox.changeFont(self.val());
    }

    /**
     * closes open settings, hides color pickers
     *
     * @return void
     */
    function minimize()
    {
        $('div.settings:visible').animate({height: 'toggle'});
        $('#text-color-picker').hide();

        current_textbox = null;
        old_color       = null;

    }

    /**
     * fires when an icon is clicked, to add
     * an icon to the canvas
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function handleIconClick(e)
    {
        var self       = $(this),
            original   = $('div.icon-box'),
            last       = $('div.contentbox').last(),
            text_color,
            clone;

        clone = $('<div class="contentbox"><img src="' + self.attr('src') + '" alt=""/>' + original.html() + '</div>').insertAfter(last);
        clone.find('div.settings').hide();
        new CanvasImage(canvas, clone, self.data('path'));
    }

    /**
     * fires when the scale input of an
     * icon changes
     *
     * @param Event e Click event triggered
     *
     * @return void
     */
    function handleScaleChange(e)
    {
        var self = $(this),
            icon = getCanvasElement(self);

        icon.setScale(self.val());
    }

    // setup color pickers
    $('#text-color-picker').farbtastic(handleTextColorChange);

    // setup event listeners
    $('#controller')
        .on('click', 'button.opener', toggleAdvancedSettings)
        .on('click', 'button.add-textbox', addTextBox)
        .on('click', 'button.remove-box', removeBox)
        .on('click', 'input.alignment', handleAlignmentClick)
        .on('click', 'p.icons img', handleIconClick)
        .on('change', 'input.font-size', handleFontSizeChange)
        .on('change', 'input.scale', handleScaleChange)
        .on('change', 'p.font select', handleFontChange)
        .on('click', handleControllerClick)
        .on('keyup', 'textarea', handleTextChange)
        .on('keyup', 'input.text-color', handleManualTextColorChange);

    $('#print').click(handlePrint);
    $('body').click(minimize);

    window.setTimeout(function() {
        determineWorkArea();
        setupFontSelector();
        setupBackgroundSelector();
        setupCanvas();
    }, 3000);
}
