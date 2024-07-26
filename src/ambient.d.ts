import type { QuestionTypes } from '$lib/constants';

type Application = {
	hasPitchDesk: boolean;
	isSubmitted: boolean;
	pitchDeskUrl: '';
	email: '';
	domain: '';
	id: string;
	program_id: string;
	profile_id: string;
	is_finish_analysis_data: boolean;
};

type Program = {
	id: string;
	category: Array<Category>;
};

type Category = {
	id: string;
	category_name: string;
	show_by_start: boolean;
	order: number;
	is_clarify_questions: boolean;
	group: Array<Group>;
	is_static: boolean;
};

type Group = {
	id: string;
	display_text: string;
	category_id: string;
	question: Array<Question>;
};

type Question = {
	id: string;
	group_id: string;
	question_text: string;
	question_info: string;
	type: QuestionTypes;
	required: boolean;
	preview_answer_text: string;
	order: number;
	need_analysis_answer: boolean;
	option: Array<Option>;
	group?: string;
	category?: string;
	isSuccess?: boolean;
	userAnswer?: string;
};

type Option = {
	display: string;
	value: string;
};

type Message = {
	id: string;
	is_send: boolean;
	application_id: string;
	is_system: boolean;
	is_dropped: boolean;
	message_object: MessageObject;
};

type MessageObject = {
	type: string;
	display: string;
	is_answer: boolean;
	is_primary: boolean;
	question_id: string;
	is_clarify_question?: boolean;
	is_suggested: boolean;
	is_finish_application?: string;
	is_finish_general_questions?: string;
	messages?: Array<{ text: string; type: string }>;
	data?: Array<{ answer: string; question_id: string; question_text: string }>;
};