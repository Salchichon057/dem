-- Vista para submissions de Organizaciones
CREATE OR REPLACE VIEW public.organizations_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.organizations_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.organizations_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Vista para submissions de Auditorías
CREATE OR REPLACE VIEW public.audits_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.audits_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.audits_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Vista para submissions de Comunidades
CREATE OR REPLACE VIEW public.communities_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.communities_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.communities_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Vista para submissions de Voluntariado
CREATE OR REPLACE VIEW public.volunteer_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.volunteer_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.volunteer_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Vista para submissions de Perfil Comunitario (PIMCO)
CREATE OR REPLACE VIEW public.community_profile_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.community_profile_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.community_profile_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Vista para submissions de Abrazando Leyendas
CREATE OR REPLACE VIEW public.embracing_legends_submissions_view AS
SELECT 
    s.id as submission_id,
    s.submitted_at,
    s.user_id,
    u.name as user_name,
    u.email as user_email,
    s.form_template_id,
    ft.name as form_name,
    ft.slug as form_slug,
    q.id as question_id,
    q.title as question_title,
    q.order_index,
    qt.code as question_type,
    a.answer_value
FROM 
    public.embracing_legends_submissions s
    INNER JOIN public.users u ON s.user_id = u.id
    INNER JOIN public.form_templates ft ON s.form_template_id = ft.id
    LEFT JOIN public.questions q ON q.form_template_id = ft.id
    LEFT JOIN public.question_types qt ON q.question_type_id = qt.id
    LEFT JOIN public.embracing_legends_answers a ON a.submission_id = s.id AND a.question_id = q.id
ORDER BY 
    s.submitted_at DESC, q.order_index ASC;

-- Grants de permisos (ajusta según tus necesidades)
GRANT SELECT ON public.organizations_submissions_view TO authenticated;
GRANT SELECT ON public.audits_submissions_view TO authenticated;
GRANT SELECT ON public.communities_submissions_view TO authenticated;
GRANT SELECT ON public.volunteer_submissions_view TO authenticated;
GRANT SELECT ON public.community_profile_submissions_view TO authenticated;
GRANT SELECT ON public.embracing_legends_submissions_view TO authenticated;
