export type RegistrationOptionsValue = {
    sessionOptions: string[];
    courseOptions: string[];
    levelOptions: string[];
    timeOptions: string[];
    feesTypeOptions: string[];
    defaultFeesAmount: number;
};

export const DEFAULT_REGISTRATION_OPTIONS: RegistrationOptionsValue = {
    sessionOptions: ['Regular', 'Mid-month'],
    courseOptions: ['Communication', 'Ilets', 'English club', 'Esp'],
    levelOptions: [
        'Pre1',
        'Pre2',
        'Level-1',
        'Level-2',
        'Level-3',
        'Level-4',
        'Level-5',
        'Level-6',
        'Level-7',
        'Level-8',
    ],
    timeOptions: ['11:00 - 01:00', '01:00 - 03:00', '03:00 - 05:00', '05:00 - 07:00'],
    feesTypeOptions: ['Register-fees', 'Course-fees', 'Repeat-fees'],
    defaultFeesAmount: 1600,
};
