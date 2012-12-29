$(function() {
    var textarea        = $('#controller textarea'),
        doc_width       = document.width,
        doc_height      = Math.round(doc_width / 1.55),
        max_text_width  = doc_width * 0.75,
        max_text_height = doc_height * 0.75,
        step            = 2, // stepsize in font points for auto-adjustment on writing
        tolerance       = 5, // percentage of max limit that text area should be wihin
        textboxes       = [],
        font_startsize  = 100,
        old_color,
        canvas,
        timeout,
        color_timeout,
        current_textbox,
        print_window;

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
        this.getCanvasText = function()
        {
            return canvas_text;
        }

        this.index                  = textboxes.length + 1;
        this.fontsize               = font_startsize;
        this.font_input             = container.find('input.font-size');
        container[0].canvas_textbox = this;

        canvas_text = new fabric.Text(container.find('textarea').val(), {
            fontSize: font_startsize,
            textAlign: 'center',
        });

        if (fonts && fonts[0]) {
            canvas_text.fontFamily = fonts[0];
        }

        textboxes.push(this);

        for (var i = 0, length = textboxes.length; i < length; ++i) {
            textboxes[i].resetBoundingBox();
        }

        canvas.add(canvas_text);
        window.setTimeout(function() {
            canvas.renderAll()
        }, 1000);
    }

    /**
     * sets/resets the bounding box for the
     * textbox, possibly repositioning it
     *
     * @return this
     */
    CanvasTextbox.prototype.resetBoundingBox = function()
    {
        var box_count = textboxes.length;

        this.max_height = max_text_height / box_count;
        this.max_width  = max_text_width;

        this.upper_limit = (doc_height - max_text_height) / 2 + (this.max_height * (this.index - 1));
        this.lower_limit = this.upper_limit + this.max_height;
        this.left_limit  = (doc_width - max_text_width) / 2;
        this.right_limit = this.left_limit + this.max_width;

        this.getCanvasText().set({top: this.upper_limit + this.max_height / 2, left: this.left_limit + this.max_width / 2});

        this.resizeText();

        return this;
    }

    /**
     * removes the textbox
     *
     * @return void
     */
    CanvasTextbox.prototype.remove = function ()
    {
        textboxes.splice(this.index - 1, 1);

        this.getCanvasText().remove();

        for (var i = 0, length = textboxes.length; i < length; i++) {
            textboxes[i].index = i + 1;
            textboxes[i].resetBoundingBox();
        }

        canvas.renderAll();
    }

    /**
     * Changes the color of the text
     *
     * @param string color New color for the text
     *
     * @return this
     */
    CanvasTextbox.prototype.setColor = function (color)
    {
        this.getCanvasText().setColor(color);
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

            modifier = step * (this.getCanvasText().getWidth() > this.max_width || this.getCanvasText().getHeight() > this.max_height ? -1 : 1);

            while (!this.isTextWithinTolerance() && limit) {
                this.fontsize += modifier;
                this.getCanvasText().setFontsize(this.fontsize);
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
        this.getCanvasText().setText(text);
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
        var text_width  = this.getCanvasText().getWidth(),
            text_height = this.getCanvasText().getHeight(),
            returnval;

        return this.isTextInsideMax()
            && (Math.abs(text_width - this.max_width) < this.max_width * tolerance / 100
                || Math.abs(text_height - this.max_height) < this.max_height * tolerance / 100);
    }

    /**
     * checks if the text painted is outside its bounding box
     *
     * @return bool
     */
    CanvasTextbox.prototype.isTextInsideMax = function()
    {
        return this.getCanvasText().getWidth() < this.max_width && this.getCanvasText().getHeight() < this.max_height;
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
        this.getCanvasText().setFontsize(this.fontsize);

        if (!this.isTextInsideMax()) {
            this.fontsize = old_size;
            this.getCanvasText().setFontsize(old_size);
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
        this.getCanvasText().fontFamily = font_family;
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
        this.getCanvasText().textAlign = alignment;
        canvas.renderAll();

        return this;
    }

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
            .setBackgroundImage('/backgrounds/' + backgrounds[0]);

        new CanvasTextbox(canvas, $('div.textbox'));
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
            select.append('<option value="/backgrounds/' + backgrounds[i] + '">' + backgrounds[i] + '</option>');
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
            current_textbox = getConnectedTextbox(self);
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
            textbox = getConnectedTextbox(self);

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
    function getConnectedTextbox(element)
    {
        var container = element.closest('div.textbox');

        if (!container[0].canvas_textbox) {
            throw new Error('Textbox not found');
        }

        return container[0].canvas_textbox;
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
            textbox = getConnectedTextbox(self);

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
            textbox = getConnectedTextbox(self);

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

        self.parent().find('div.textbox-settings').animate({height: 'toggle'});
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
        var original   = $('div.textbox').first(),
            last       = $('div.textbox').last(),
            text_color,
            clone;

        clone = $('<div class="textbox">' + original.html() + '</div>').insertAfter(last);
        clone.find('button.add-textbox').removeClass('add-textbox').addClass('remove-textbox').text('-');
        clone.find('div.textbox-settings').hide();
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
    function removeTextBox()
    {
        var container = $(this).closest('div.textbox'),
            textbox   = getConnectedTextbox($(this));

        textbox.remove();

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
            textbox   = getConnectedTextbox(self);

        textbox.changeFont(self.val());
    }

    /**
     * closes open settings, hides color pickers
     *
     * @return void
     */
    function minimize()
    {
        $('div.textbox-settings:visible').animate({height: 'toggle'});
        $('#text-color-picker').hide();

        current_textbox = null;
        old_color       = null;

    }

    // setup color pickers
    $('#text-color-picker').farbtastic(handleTextColorChange);

    // setup event listeners
    $('#controller')
        .on('click', 'button.opener', toggleAdvancedSettings)
        .on('click', 'button.add-textbox', addTextBox)
        .on('click', 'button.remove-textbox', removeTextBox)
        .on('click', 'input.alignment', handleAlignmentClick)
        .on('change', 'input.font-size', handleFontSizeChange)
        .on('change', 'p.font select', handleFontChange)
        .on('click', handleControllerClick)
        .on('keyup', 'textarea', handleTextChange)
        .on('keyup', 'input.text-color', handleManualTextColorChange);

    $('#print').click(handlePrint);
    $('body').click(minimize);

    window.setTimeout(function() {
        setupCanvas();
        setupFontSelector();
        setupBackgroundSelector();
    }, 3000);
});
