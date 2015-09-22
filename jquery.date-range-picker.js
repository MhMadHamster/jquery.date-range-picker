;(function($) {

    var methods = {

        // инициализирует календарь
        init: function() {
            var options = {};
            for (var i = 0; i < arguments.length; i++) {
                switch ({}.toString.call(arguments[i])) {
                    case '[object Object]':
                        options = $.extend({}, arguments[i] || {});
                        break;
                    default:
                        options = $.extend({});
                        break;
                }
            };

            return this.each(function() {
                var newOptions = $.extend({}, (options || {}), {
                    beforeShow: highlightRange,
                    beforeShowDay: customDay,
                    onSelect: setRange,
                    numberOfMonths: (options.numberOfMonths && $(window).width() > 767) ? options.numberOfMonths : 1,
                    startDate: options.startDate || '.date_arr',
                    endDate: options.endDate || '.date_dep',
                    dateFormat: 'dd.mm.yy'
                });


                var selectedArr = null;
                var selectedDep = null;
                var dateStartInput = $(this).find(newOptions.startDate);
                var dateEndInput = $(this).find(newOptions.endDate);
                var dateMaxRange = newOptions.dateMaxRange || null;

                /**
                 * Функция в зависимости от даты, если она попадает в диапазон выбранных
                 * присвает ячейке(дню) класс
                 * 
                 * @param дата дня
                 * @return возвращаем необходимый набор параметров для datepicker'a
                 */
                function customDay(date) {
                    if (selectedArr && (+date == +selectedArr)) {
                        return [true, 'ui-datepicker-dayRange-in'];
                    };
                    if (selectedDep && (+date == +selectedDep)) {
                        return [true, 'ui-datepicker-dayRange-out'];
                    };
                    if (selectedDep && selectedArr && (+date > +selectedArr && +date < +selectedDep)) {
                        return [true, 'ui-datepicker-dayRange'];
                    };
                    return [true, ''];
                };

                /**
                 * Получаем дату дня по переданному td
                 * 
                 * @param  $(element) td - элемент таблицы
                 * @return Date - возвращаем дату
                 */
                function getDateFromTd(td) {
                    var year = td.data('year');
                    var month = td.data('month');
                    var day = td.children().html();
                    return new Date(year, month, day);
                };

                /**
                 * При выборе даты записывает их в переменные,
                 * обновляет нижнюю границу согласно заданному макс числу
                 */
                function setRange(selectedDate) {

                    if($(this).hasClass(newOptions.endDate.substring(1)))  selectedDep = new Date(selectedDate.split('.')[2], selectedDate.split('.')[1] - 1, selectedDate.split('.')[0]);

                    if($(this).hasClass(newOptions.startDate.substring(1))) {
                        selectedArr = new Date(selectedDate.split('.')[2], selectedDate.split('.')[1] - 1, selectedDate.split('.')[0]);

                        if(dateMaxRange && selectedDep) {
                            var dayDiff =  Math.ceil(Math.abs(selectedDep.getTime() - selectedArr.getTime()) / (1000 * 3600 * 24));
                            if(dayDiff > dateMaxRange) {
                                selectedDep.setDate(selectedDep.getDate() - (dayDiff - dateMaxRange));
                            }
                            if(+selectedArr >= +selectedDep) {
                                selectedDep = null;
                                dateEndInput.val('');
                            }
                        }

                        if (dateMaxRange) {
                            var dateMin = dateStartInput.datepicker("getDate");
                            var rMin = new Date(dateMin.getFullYear(), dateMin.getMonth(),dateMin.getDate() + 1); 
                            var rMax = new Date(dateMin.getFullYear(), dateMin.getMonth(),dateMin.getDate() + dateMaxRange); 
                            dateEndInput.datepicker('option', {
                                minDate: rMin,
                                maxDate: rMax
                            });
                        };

                        setTimeout(function() {
                            dateEndInput.trigger('focus');
                        }, 200);
                    }
                };

                /**
                 * Функция вешает на календарь обработчики ховер эффекта
                 * при котором добавляються классы
                 */
                function highlightRange(input) {
                    $('#ui-datepicker-div').off('mouseenter mouseleave', 'td');

                    if ($(input).hasClass(newOptions.startDate.substring(1))) {
                        $('#ui-datepicker-div').on('mouseenter', 'td', function() {
                            if(!$(this).hasClass('ui-datepicker-unselectable')) {
                                $(this).addClass('ui-datepicker-dayRange-in-highlight');
                                var highlightDate = getDateFromTd($(this));
                                if(selectedDep) {
                                    $('#ui-datepicker-div').find('td').each(function() {
                                        if (+highlightDate < getDateFromTd($(this)) && +getDateFromTd($(this)) < +selectedDep) {
                                            $(this).addClass('ui-datepicker-dayRange-highlight');
                                        };
                                    });
                                }
                            }
                        });
                        $('#ui-datepicker-div').on('mouseleave', 'td', function() {
                            $(this).removeClass('ui-datepicker-dayRange-in-highlight');
                            $('#ui-datepicker-div td').removeClass('ui-datepicker-dayRange-highlight');
                        });
                    };

                    if ($(input).hasClass(newOptions.endDate.substring(1))) {
                        $('#ui-datepicker-div').on('mouseenter', 'td', function() {
                            if(!$(this).hasClass('ui-datepicker-unselectable')) {
                                $(this).addClass('ui-datepicker-dayRange-out-highlight');
                                var highlightDate = getDateFromTd($(this));
                                if(selectedArr) {
                                    $('#ui-datepicker-div').find('td').each(function() {
                                        if (+highlightDate > +getDateFromTd($(this)) && +getDateFromTd($(this)) > +selectedArr) {
                                            $(this).addClass('ui-datepicker-dayRange-highlight');
                                        };
                                    });
                                }
                            }
                        });
                        $('#ui-datepicker-div').on('mouseleave', 'td', function() {
                            $(this).removeClass('ui-datepicker-dayRange-out-highlight');
                            $('#ui-datepicker-div td').removeClass('ui-datepicker-dayRange-highlight');
                        });
                    };
                };

                dateStartInput.datepicker(newOptions);
                dateEndInput.datepicker(newOptions);

                // чекбокс даты неизвестны
                $(this).find('input[type="checkbox"].date-unknown').change(function() {
                    if ($(this).is(':checked')) {
                        dateStartInput.attr('disabled', true);
                        dateStartInput.addClass('disabled');
                        dateEndInput.attr('disabled', true);
                        dateEndInput.addClass('disabled');
                    } else {
                        dateStartInput.attr('disabled', false);
                        dateStartInput.removeClass('disabled');
                        dateEndInput.attr('disabled', false);
                        dateEndInput.removeClass('disabled');
                    }
                });

                // по ресайзу окна если ширина меньше минимально необходимой то показывает 1 месяц
                $(window).resize(function() {
                    if($(this).width() < 530) {
                        dateStartInput.datepicker('option', 'numberOfMonths', 1);
                        dateEndInput.datepicker('option', 'numberOfMonths', 1);
                    }
                });
            });
        },

        destroy: function() {
            this.each(function() {
                $(this).find('.date_arr').datepicker('destroy');
                $(this).find('.date_dep').datepicker('destroy');
            });
        }
    };

    /**
     *  функция принимает на вход "метод" который будет искать в объекте methods
     *  если не передавать ничего, то вызываеться init
     */
    $.fn.dateRangePicker = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' +  method + ' не существует для jQuery.dateRangePicker');
        }

    };

})(jQuery);