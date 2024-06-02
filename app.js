async function getRaceDetails() {
    try {
        // Fetch data

        const response = await fetch('./data.json');
        const data = await response.json();

        // Get current date
        const currentDate = new Date();

        // Find the nearest future Race based on current date
        let nearestFutureRace = null;
        for (const Race of data.races) {
            const FP1Date = new Date(Race.sessions.FP1);
            const gpDate = new Date(Race.sessions.Race);

            // Check if current date is within the range of FP1 to Race of the Race
            if (currentDate >= FP1Date && currentDate <= gpDate) {
                nearestFutureRace = Race;
                break;
            }

            // Check if current date is before FP1 of the Race
            if (currentDate < FP1Date) {
                if (!nearestFutureRace || FP1Date < new Date(nearestFutureRace.sessions.FP1)) {
                    nearestFutureRace = Race;
                }
                break;
            }
        }

        if (!nearestFutureRace) {
            console.log('No upcoming races found.');
            return null;
        }
        return nearestFutureRace;
    } catch (error) {
        console.log("Error getting raceData: " + error);
        return null;
    }
}

function populateData(nearestFutureRace) {
    try {
        if (!nearestFutureRace) {
            console.log('No upcoming races found.');
            return;
        }

        // Populate Race name and round
        document.getElementById('raceName').innerText = nearestFutureRace.name;
        document.getElementById('loc').innerText =`${nearestFutureRace.location}`;

        // Calculate start and end dates
        const startDate = new Date(nearestFutureRace.sessions.FP1);
        const endDate = new Date(nearestFutureRace.sessions.Race);

        // Format start and end dates
        const options = { day: '2-digit' };
        const options2 = { month: 'short' };
        const formattedDate = new Intl.DateTimeFormat('en-US', options2).format(startDate);
        const formattedStartDate = new Intl.DateTimeFormat('en-US', options).format(startDate);
        const formattedEndDate = new Intl.DateTimeFormat('en-US', options).format(endDate);
        document.getElementById('raceDates').innerText = `${formattedStartDate} - ${formattedEndDate} ${formattedDate}`;

        // Get user's local timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Format session times
        const formattedSessions = [];
        for (const [sessionName, sessionTime] of Object.entries(nearestFutureRace.sessions)) {
            const date = new Date(sessionTime);

            // Format the date according to user timezone
            const options = { weekday: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: userTimezone };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

            // Add to the formatted sessions array
            formattedSessions.push({ sessionName, formattedDate });
        }

        // Populate the schedule
        const scheduleElement = document.getElementById('schedule');
        scheduleElement.innerHTML = ''; // Clear existing content
        let currentDay = '';
        formattedSessions.forEach(session => {
            const [day, date, time] = session.formattedDate.split(', ');
            if (day !== currentDay) {
                currentDay = day;
                const dayElement = document.createElement('div');
                const daySpan = document.createElement('span');
                daySpan.className = 'day';
                daySpan.innerText = day;
                dayElement.appendChild(daySpan);
                scheduleElement.appendChild(dayElement);
            }
            const sessionElement = document.createElement('div');
            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            dateSpan.innerText = date;
            const sessionSpan = document.createElement('span');
            sessionSpan.className = 'session';
            sessionSpan.innerText = session.sessionName;
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.innerText = null;
            sessionElement.appendChild(timeSpan);
            sessionElement.appendChild(sessionSpan);
            sessionElement.appendChild(dateSpan);
            scheduleElement.appendChild(sessionElement);
        });
    } catch (error) {
        console.error('Error fetching Race data:', error);
    }
}

async function init() {
    const nearestFutureRace = await getRaceDetails();
    populateData(nearestFutureRace);
}

init();

export async function RaceData() {
    const nearestFutureRace = await getRaceDetails();
    return nearestFutureRace;
}