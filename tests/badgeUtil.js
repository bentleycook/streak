const moment = require('../public/js/moment.js')
const tz = require('../public/js/moment-timezone.min.js');
const timezone = 'Australia/Sydney';
// This file exists to test only

///////////////////////////////////////////////////////////////////////// badgeUtil

/**Returns streak, assuming user has completed today (if not and it's required, 0 streak)
 * @param {moment}            today           today's date
 * @param {string[]}          days            days habit completed
 * @param {"MONDAY"/"SUNDAY"} firstDayOfWeek  setting value
 * @param {number}            daysInWeek      number of days in week habit required
 */
var getStreak = function(today, days, firstDayOfWeek, daysInWeek) {
    const todayString = today.format("MM/DD/YYYY");
  
    // If today is not included and it's a 7dayer, no streak
    if (!(days.indexOf(todayString) >= 0) && daysInWeek === 7) {
        return 0;
    }
  
    // Find out whether streak is met this week 
    const datesThisWeek = calendarDatesThisWeek(firstDayOfWeek, today);
    const daysThisWeek = days.filter(value => -1 !== datesThisWeek.indexOf(value));

    // Number of days from today to end of week
    const daysRemainingThisWeek = 7 - datesThisWeek.length;
  
    console.log('datesThisWeek should be 4!', datesThisWeek);

    // 4 >= 7 - 3 // but its 4, 7 2 for some reason
    // days we have hit the streak this week >= days we need to hit the streak - daysRemainingThisWeek
    if (daysThisWeek.length >= daysInWeek - daysRemainingThisWeek) {

        const streakThisWeek = Math.min(daysThisWeek.length, daysInWeek);

        let endDayLooper = moment(datesThisWeek[0], 'MM/DD/YYYY').subtract(1, 'day');
        let totalStreak = streakThisWeek;
        let counter = 0;

        while (totalStreak >= streakThisWeek + counter * daysInWeek) {
            const datesThatWeek = calendarDatesThisWeek(firstDayOfWeek, endDayLooper);
            const daysThatWeek = days.filter(value => -1 !== datesThatWeek.indexOf(value));
            const streakForThatWeek = getStreakForWeek(endDayLooper, daysThatWeek, firstDayOfWeek, daysInWeek);

            totalStreak += streakForThatWeek;

            // Prepare for next loop
            counter++;
            endDayLooper = endDayLooper.subtract(7, 'day');
        }
 
        return totalStreak;
    }

    // Otherwise we know that this week is the week the streak was started
    return getStreakForWeek(moment(today, 'MM/DD/YYYY'), daysThisWeek, firstDayOfWeek, daysInWeek);
};

/** Gets end day of week that was previousCount weeks ago
 * @param {moment}  today
 * @param {"M"/"S"} firstDayOfWeek
 * @param {number}  weeksAgo        i.e last week = 1 week ago  
 */
// var getEndDayOfPreviousWeek = function(today, firstDayOfWeek, weeksAgo) {

// }

/** Get starting date of the week that the given day is in
 * @param {"MONDAY" || "SUNDAY"} firstDayOfWeek
 * @param {moment}               day
 */
var getStartOfWeek = function(firstDayOfWeek, day) {
    if (firstDayOfWeek === "MONDAY") {
       return moment(day, 'MM/DD/YYYY').tz(timezone).startOf('isoWeek');
    } else {
       return moment(day, 'MM/DD/YYYY').tz(timezone).startOf('week');
    }
}

/** Returns streak for given week
 * @param {moment} endDay          final day's date
 * @param {list}   daysThisWeek    dates habit has hit this week (never including today)
 * @param {enum}   firstDayOfWeek  day week starts. MONDAY or SUNDAY
 * @param {number} daysInWeek      number of days habit must be hit in a week
 */
var getStreakForWeek = function(endDay, daysThisWeek, firstDayOfWeek, daysInWeek, timezone) {
    // Dates from start of this week to yesterday
    const calendarDates = calendarDatesThisWeek(firstDayOfWeek, endDay);
    // Number of days from today to end of week
    const daysRemainingThisWeek = 7 - calendarDates.length;

    if (daysThisWeek.length >= daysInWeek - daysRemainingThisWeek) {
        return Math.min(daysThisWeek.length, daysInWeek);
    }

    // Number of days that can be skipped from start of this week to yesterday, to maintain streak
    const skippableDaysThisWeek = calendarDates.length - (daysInWeek - daysRemainingThisWeek);

    let dateLooper = moment(endDay, 'MM/DD/YYYY');
    const startOfWeek = getStartOfWeek(firstDayOfWeek, endDay);
    let daysMissed = 0;
    let streakCount = 0;
  
    // Loop backwards to determine date at which streak begins 
    while (dateLooper.isAfter(startOfWeek) && daysMissed <= (skippableDaysThisWeek))  {
        if (daysThisWeek.indexOf(dateLooper.format('MM/DD/YYYY')) >= 0) {
            streakCount += 1;
        } else {
            daysMissed += 1;
        }    
        dateLooper.subtract(1, 'd');
    }

    return Math.min(streakCount, daysInWeek);
}


// Return dates in MM/DD/YYYY format from startDay to yesterday
var calendarDatesThisWeek = function(firstDayOfWeek, yesterday) {
  console.log('broken bit -> calendarDatesThisWeek', yesterday);
    const startOfWeek = getStartOfWeek(firstDayOfWeek, yesterday);
  console.log('startOfWeek???', startOfWeek.format("MM-DD-YYYY"));
  console.log('yesterday???',yesterday.format("MM-DD-YYYY"));
    return getDatesInRange(startOfWeek, yesterday);
}

// Return dates in MM/DD/YYYY format for entire week that day is in
var calendarDatesInWeek = function(firstDayOfWeek, day) {
    console.log('calendarDatesInWeek', firstDayOfWeek, day);
    const startOfWeek = getStartOfWeek(firstDayOfWeek, day);
    return getDatesInRange(startOfWeek, moment(startOfWeek, 'MM/DD/YYYY').add(6, 'd'));
}

/** Return dates from startDay to EndDay
 * @param   {moment} startDay
 * @param   {moment} endDay
 * @returns {list} in format MM/DD/YYYY
 */
var getDatesInRange = function(startDay, endDay) {
    let datesThisWeek = [];
    var dateLooper = startDay;

    while (moment(dateLooper, 'MM/DD/YYYY').isBefore(endDay)) {
        datesThisWeek.push(dateLooper.format('MM/DD/YYYY'));
        dateLooper.add(1, 'd');
    }
  
    return datesThisWeek;
}


if (typeof exports !== 'undefined') {
    exports.getStreak = getStreak;
    exports.getStreakForWeek = getStreakForWeek;
    exports.calendarDatesThisWeek = calendarDatesThisWeek;
    exports.calendarDatesInWeek = calendarDatesInWeek;
    exports.getDatesInRange = getDatesInRange;
}