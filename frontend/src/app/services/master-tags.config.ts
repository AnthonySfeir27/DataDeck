export interface MasterTagDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: MasterTagField[];
}

export interface MasterTagField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'checkbox' | 'url' | 'array' | 'nested';
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  nested?: MasterTagField[];
}

export const MASTER_TAGS: MasterTagDefinition[] = [
  {
    id: 'note',
    name: 'Note',
    icon: '📝',
    description: 'A simple note with basic fields',
    fields: []
  },
  {
    id: 'task',
    name: 'Task',
    icon: '✅',
    description: 'Track tasks with deadlines',
    fields: [
      {
        id: 'deadline',
        label: 'Deadline',
        type: 'datetime',
        required: false,
        placeholder: 'When is this due?'
      },
      {
        id: 'completed',
        label: 'Completed',
        type: 'checkbox',
        required: false
      }
    ]
  },
  {
    id: 'movie',
    name: 'Movie',
    icon: '🎬',
    description: 'Track movies you want to watch',
    fields: [
      {
        id: 'watched',
        label: 'Watched',
        type: 'checkbox',
        required: false
      },
      {
        id: 'watch_date',
        label: 'Watch Date',
        type: 'datetime',
        required: false,
        placeholder: 'When did you watch it?'
      },
      {
        id: 'movie_url',
        label: 'Movie URL',
        type: 'url',
        required: false,
        placeholder: 'Link to movie (IMDb, etc.)'
      }
    ]
  },
  {
    id: 'tv_series',
    name: 'TV Series',
    icon: '📺',
    description: 'Track TV series episodes',
    fields: [
      {
        id: 'season_count',
        label: 'Number of Seasons',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'How many seasons?'
      },
      {
        id: 'episodes_per_season',
        label: 'Episodes Per Season',
        type: 'array',
        required: true,
        placeholder: 'Episodes in each season (comma separated)'
      },
      {
        id: 'series_url',
        label: 'Series URL',
        type: 'url',
        required: false,
        placeholder: 'Link to series (IMDb, etc.)'
      },
      {
        id: 'watched_episodes',
        label: 'Watched Episodes',
        type: 'nested',
        required: false
      }
    ]
  },
  {
    id: 'video_game',
    name: 'Video Game',
    icon: '🎮',
    description: 'Track video games and progress',
    fields: [
      {
        id: 'completed',
        label: 'Completed',
        type: 'checkbox',
        required: false
      },
      {
        id: 'hours_played',
        label: 'Hours Played',
        type: 'number',
        required: false,
        min: 0,
        placeholder: 'How many hours?'
      },
      {
        id: 'dlcs',
        label: 'DLCs',
        type: 'array',
        required: false,
        placeholder: 'List of DLCs'
      },
      {
        id: 'game_tasks',
        label: 'In-Game Tasks',
        type: 'nested',
        required: false
      }
    ]
  },
  {
    id: 'book',
    name: 'Book',
    icon: '📚',
    description: 'Track books and reading progress',
    fields: [
      {
        id: 'total_pages',
        label: 'Total Pages',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'How many pages?'
      },
      {
        id: 'current_page',
        label: 'Current Page',
        type: 'number',
        required: false,
        min: 0,
        placeholder: 'What page are you on?'
      },
      {
        id: 'author',
        label: 'Author',
        type: 'text',
        required: false,
        placeholder: 'Who wrote this?'
      },
      {
        id: 'bookmarks',
        label: 'Bookmarks',
        type: 'nested',
        required: false
      }
    ]
  },
  {
    id: 'event',
    name: 'Event',
    icon: '📅',
    description: 'Track events and schedules',
    fields: [
      {
        id: 'start_time',
        label: 'Start Time',
        type: 'datetime',
        required: true,
        placeholder: 'When does it start?'
      },
      {
        id: 'end_time',
        label: 'End Time',
        type: 'datetime',
        required: false,
        placeholder: 'When does it end?'
      }
    ]
  }
];
