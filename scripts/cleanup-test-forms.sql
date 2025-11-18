-- =====================================================
-- Script para eliminar formularios de prueba
-- Mantiene solo los formularios con IDs:
-- - 00e49c23-1f8a-45e0-947e-2c9bcdca0898
-- - 0c1b6e6d-26aa-4d68-8a09-10855af22b77
-- =====================================================

-- IMPORTANTE: Ejecutar este script con precaución
-- Se recomienda hacer un backup antes de ejecutar

BEGIN;

-- 1. Eliminar respuestas de formularios que vamos a borrar
-- (Las tablas de respuestas específicas por sección)

DELETE FROM organizations_answers 
WHERE submission_id IN (
  SELECT id FROM organizations_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

DELETE FROM audits_answers 
WHERE submission_id IN (
  SELECT id FROM audits_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

DELETE FROM communities_answers 
WHERE submission_id IN (
  SELECT id FROM communities_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

DELETE FROM volunteer_answers 
WHERE submission_id IN (
  SELECT id FROM volunteer_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

DELETE FROM community_profile_answers 
WHERE submission_id IN (
  SELECT id FROM community_profile_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

DELETE FROM embracing_legends_answers 
WHERE submission_id IN (
  SELECT id FROM embracing_legends_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

-- Respuestas genéricas
DELETE FROM submission_answers 
WHERE submission_id IN (
  SELECT id FROM form_submissions 
  WHERE form_template_id NOT IN (
    '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
    '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
  )
);

-- 2. Eliminar submissions específicas por sección
DELETE FROM organizations_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

DELETE FROM audits_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

DELETE FROM communities_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

DELETE FROM volunteer_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

DELETE FROM community_profile_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

DELETE FROM embracing_legends_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- Submissions genéricas
DELETE FROM form_submissions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- 3. Eliminar asignaciones de formularios
DELETE FROM form_assignments 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- 4. Eliminar preguntas
DELETE FROM questions 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- 5. Eliminar secciones de formularios
DELETE FROM form_sections 
WHERE form_template_id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- 6. Eliminar logs de auditoría relacionados
DELETE FROM audit_log 
WHERE entity_type IN ('form_templates', 'questions', 'form_submissions', 'submission_answers')
  AND entity_id IN (
    SELECT id FROM form_templates 
    WHERE id NOT IN (
      '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
      '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
    )
  );

-- 7. FINALMENTE: Eliminar los form_templates
DELETE FROM form_templates 
WHERE id NOT IN (
  '00e49c23-1f8a-45e0-947e-2c9bcdca0898',
  '0c1b6e6d-26aa-4d68-8a09-10855af22b77'
);

-- Mostrar cuántos formularios quedan
SELECT 
  COUNT(*) as total_formularios_restantes,
  STRING_AGG(name, ', ') as nombres_formularios
FROM form_templates;

-- Verificar que solo quedaron los 2 formularios correctos
SELECT 
  id,
  name,
  slug,
  section_location,
  created_at
FROM form_templates
ORDER BY created_at DESC;

COMMIT;

-- Si algo sale mal, puedes hacer ROLLBACK en lugar de COMMIT
-- ROLLBACK;