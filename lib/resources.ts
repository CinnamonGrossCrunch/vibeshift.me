export type ResourceItem = {
  text: string;
  url?: string;
};

export type ResourceCategory = {
  name: string;
  icon: string;
  items: ResourceItem[];
};

export type HaasResourcesData = {
  categories: {
    [key: string]: ResourceCategory;
  };
};

// Static data extracted from the HTML - this can be updated as needed
export async function getHaasResourcesData(): Promise<HaasResourcesData> {
  return {
    categories: {
      housekeeping: {
        name: 'Housekeeping',
        icon: '',
        items: [
          {
            text: 'EWMBAA Suggestion Box',
            url: 'https://forms.gle/HbmCkdfdRCzQYaay9'
          },
          {
            text: 'Microwaves and Fridges in the MBA Commons (next to BofA Forum)'
          },
          {
            text: 'Order a replacement name plate or name badge',
            url: 'https://haas.berkeley.edu/ewmba/tools/name-plate-badge-replacement/'
          },
          {
            text: 'Order Haas business cards',
            url: 'http://campuslifeservices.ucsf.edu/ucprint/'
          },
          {
            text: 'Register for a Virtual N/W Parking Permit',
            url: 'https://haas.berkeley.edu/ewmba/student-experience/parking-transportation/#virtualpermit'
          },
          {
            text: 'Schedule an appointment with your academic advisor',
            url: 'http://haas.berkeley.edu/EWMBA/contacts/'
          },
          {
            text: 'Request a Grade Letter',
            url: 'https://haas.berkeley.edu/ewmba/tools/grade-letter-requests/'
          }
        ]
      },
      haasResources: {
        name: 'Haas Resources',
        icon: '',
        items: [
          {
            text: 'DEIJB Calendar',
            url: 'https://calendar.google.com/calendar/u/0/embed?src=c_5jqgdb8ij75d87v8n8auajgulc@group.calendar.google.com&ctz=America/Los_Angeles'
          },
          {
            text: 'Disability Cultural Community Center Events and Resources Calendar',
            url: 'https://calendar.google.com/calendar/u/0/embed?src=disabilityculture@berkeley.edu&ctz=America/Los_Angeles'
          },
          {
            text: 'Email Facilities at fixit@haas.berkeley.edu',
            url: 'mailto:fixit@haas.berkeley.edu'
          },
          {
            text: 'Email Haas Financial Aid at finaid@haas.berkeley.edu',
            url: 'mailto:finaid@haas.berkeley.edu'
          },
          {
            text: 'Email Haas Lost & Found at lost@haas.berkeley.edu',
            url: 'mailto:lost@haas.berkeley.edu'
          },
          {
            text: 'Email Technology Solutions HelpDesk at helpdesk@haas.berkeley.edu',
            url: 'mailto:helpdesk@haas.berkeley.edu'
          },
          {
            text: 'Long Business Library',
            url: 'https://www.lib.berkeley.edu/visit/business'
          },
          {
            text: 'Prayer & Meditation Room Access Form',
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfPRFv3uekREaZtmiEwr874-Dc5tBmKMuLc9EklmTAqFtfpgA/viewform'
          },
          {
            text: 'Student-Alumni Engagement Resources',
            url: 'https://haas.berkeley.edu/alumni/alumni-network/student-alumni-connections/'
          }
        ]
      },
      ucBerkeley: {
        name: 'UC Berkeley Resources',
        icon: '',
        items: [
          {
            text: 'CalCentral – update your official mailing address, check grades, etc',
            url: 'https://calcentral.berkeley.edu/'
          },
          {
            text: 'Office of the Registrar – important forms, diplomas',
            url: 'http://registrar.berkeley.edu/'
          },
          {
            text: 'Cal Student Central – billing and payments questions',
            url: 'http://studentcentral.berkeley.edu/'
          }
        ]
      },
      safety: {
        name: 'Safety and Security Numbers',
        icon: '',
        items: [
          {
            text: 'Haas Campus Security Officer (CSO) 510-292-7800'
          },
          {
            text: 'UCPD Emergency: Call 911 via campus landline or 510-642-3333 via cell phone',
            url: 'https://ucpd.berkeley.edu/directory'
          },
          {
            text: 'UCPD Non-Emergency: 510-642-6760',
            url: 'https://ucpd.berkeley.edu/directory'
          },
          {
            text: 'WarnMe (campus safety notifications)',
            url: 'https://warnme.berkeley.edu/'
          },
          {
            text: 'BearWalk (On Demand, Campus Security Escort to student vehicles)',
            url: 'https://bearwalk.ridecell.com/request'
          },
          {
            text: 'Emergency Evacuation Plan',
            url: 'https://haas.berkeley.edu/facilities/safety-and-emergency/evacuation-routes/'
          }
        ]
      },
      technology: {
        name: 'Technology',
        icon: '',
        items: [
          {
            text: 'Campus VPN',
            url: 'https://haas.berkeley.edu/technology-solutions/how-do-i/access/#vpn'
          },
          {
            text: 'Printing at Haas',
            url: 'https://haas.berkeley.edu/technology-solutions/how-do-i/printing/#adding-printers'
          },
          {
            text: 'Berkeley Haas Email Signature',
            url: 'https://haas.berkeley.edu/brand-toolkit/toolkit/email-signatures/'
          }
        ]
      },
      computerCenter: {
        name: 'Computer Center',
        icon: '',
        items: [
          {
            text: 'The Computer Center is permanently closed.'
          },
          {
            text: 'Self-service instructions on their website. You can schedule a Student Tech Support Zoom Drop In Appointment as well.',
            url: 'https://haas.berkeley.edu/technology-solutions/tech-resources/service-changes/'
          },
          {
            text: 'Schedule a Student Tech Support Zoom Drop In Appointment',
            url: 'https://calendar.google.com/calendar/selfsched?sstoken=UURPSVd5d0xKRi1tfGRlZmF1bHR8ZmQzYzMxMDQzYjFiZTQyYTRjZTZkMTM1MzhlN2ZlNDI'
          },
          {
            text: 'Print stations are available in Chou Hall, 3rd and 5th floors. Use the online WebPrint portal to send documents to those printers.',
            url: 'https://haas.berkeley.edu/technology-solutions/how-do-i/printing/#webprint'
          },
          {
            text: 'The Bloomberg Terminals have moved to the Library and FactSet can be accessed online.'
          }
        ]
      }
    }
  };
}
