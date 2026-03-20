export type ApiProposal = {
	_id: string;
	user_id: string;
	session_id: string;
	request: string;
	proposal: {
		venue_name: string;
		location: string;
		estimated_cost: string;
		why_it_fits: string;
	};
	created_at: string;
};

export type SearchRecord = {
	id: string;
	sessionId: string;
	prompt: string;
	venueName: string;
	location: string;
	estimatedCost: string;
	whyItFits: string;
	createdAt: string;
};
