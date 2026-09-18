import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    roles: Role[];
}

export interface Role {
    id: number;
    name: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    phone: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    locale: string;
    appearance: 'light' | 'dark' | 'system';

    [key: string]: unknown;
}

export interface SearchData {
    search?: string;
    per_page?: number;
    page?: number;
    total?: number;
    from?: string;
    to?: string;
    month?: string;
    date?: string;
    daysInMonth?: number;
    role?: string;

    [key: string]: string | number; // Allow dynamic keys
}

export interface Link {
    active: string;
    label: string;
    url: string;
}

export interface Language {
    id: number;
    code: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
    flag: string;
    tests?: Test[];
    tests_count?: number;
}

export interface Test {
    id: number;
    user_id: number;
    name: string;
    description: string;
    language_id: number;
    audio_path: string;
    is_public: number;
    created_at: string;
    updated_at: string;
    parts?: Part[];
    language?: Language;
    folder?: { name: string };
    types?: any[];
    attempts_count?: number;
}

export interface TestPaginate {
    data: Test[];
    search: string;
    per_page: number;
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    links: Link[];
}

export interface MockStudent {
    id: number;
    mock_id: number;
    name: string;
    code: string;
    attended: boolean;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
    mock?: Mock;
    attempt?: Attempt;
}

export interface Mock {
    id: number;
    user_id: number;
    test_id?: number;
    name: string;
    comment?: string;
    description?: string;
    audio_path?: string;
    started_at?: string;
    starts_at?: string;
    finished_at?: string;
    slug: string;
    active: number;
    open?: number;
    status?: 'active' | 'scheduled' | 'expired' | 'inactive';
    created_at: string;
    updated_at: string;
    user?: User;
    test?: Test;
    students?: MockStudent[];
    attempts?: Attempt[];
    mock_tests?: MockTest[];
}

export interface MockPaginate {
    data: Mock[];
    search: string;
    per_page: number;
    from: number;
    to: number;
    total: number;
    current_page: number;
    links: Link[];
}

export interface MockTest {
    id: number;
    mock_id: number;
    test_id: number;
    created_at: string;
    updated_at: string;
    mock?: Mock;
    test?: Test;
}

export interface Part {
    id: number;
    test_id: number;
    name: string;
    description: string;
    audio_path: string;
    created_at: string;
    updated_at: string;
    test?: Test;
    questions?: Question[];
}

export interface Question {
    id: number;
    part_id: number;
    textarea: string;
    audio_path: string;
    audio_second: string;
    ready_second: string;
    answer_second: string;
    created_at: string;
    updated_at: string;
    part?: Part;
}

export interface UserPaginate {
    data: User[];
    search: string;
    per_page: number;
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    links: Link[];
}

export interface User {
    id: number;
    name: string;
    username: string;
    phone: string;
    email: string;
    email_verified_at: string | null;
    password: string;
    avatar: string;
    google_id: number;
    telegram_id: string;
    ref_telegram_id: string;
    create_test_limit: number;

    roles?: Role[];
    created_at: string;
    updated_at: string;

    attempts: Attempt[];
    last_attempt?: Attempt;

    attempts_count?: number;
    tests_count?: number;
    mocks_count?: number;

    [key: string]: unknown;
}

export interface Attempt {
    id: number;
    name: string;
    user_id?: number;
    mock_id?: number;
    mock_student_id?: number;
    test_id: number;
    score: number;
    tab_switch_count?: number;
    review: string;
    started_at: string;
    finished_at: string;
    evaluated_at: string;
    created_at: string;
    updated_at: string;
    user?: User;
    test?: Test;
    mock?: Mock;
    mock_student?: { id: number; name: string };
    mockStudent?: { id: number; name: string };
    attempt_parts?: AttemptPart[];
    ai_score_avg?: number;
}

export interface AttemptPart {
    id: number;
    attempt_id: number;
    part_id: number;
    score: number;
    started_at: string;
    finished_at: string;
    created_at: string;
    updated_at: string;
    part?: Part;
    attempt?: Attempt;
    attempt_answers?: AttemptAnswer[];
    ai_score_avg?: number;
}

export interface AttemptAnswer {
    id: number;
    attempt_part_id: number;
    question_id: number;
    started_at: string;
    finished_at: string;
    audio_path: string;
    audio_second: string;
    transcript: string;
    review_ai: string;
    review: string;
    score_ai: number;
    score: number;
    created_at: string;
    updated_at: string;
    attempt_part?: AttemptPart;
    question?: Question;
}

export interface AttemptPaginate {
    data: Attempt[];
    search: string;
    per_page: number;
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    links: Link[];
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface StatItem {
    day_date: string;
    items_count: number;
    unique_users_count: number;
}

export interface HourlyStatItem {
    hour: number;
    items_count: number;
}

export interface WeeklyStatItem {
    weekday: number; // 1=Mon..7=Sun
    items_count: number;
}
