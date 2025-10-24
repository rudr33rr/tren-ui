export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '13.0.5'
	}
	graphql_public: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			graphql: {
				Args: {
					extensions?: Json
					operationName?: string
					query?: string
					variables?: Json
				}
				Returns: Json
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	public: {
		Tables: {
			exercises: {
				Row: {
					difficulty: Database['public']['Enums']['difficulty_level']
					exercise_name: string | null
					id: number
					primary_muscle_id: number | null
					secondary_muscle_ids: number[] | null
				}
				Insert: {
					difficulty?: Database['public']['Enums']['difficulty_level']
					exercise_name?: string | null
					id?: number
					primary_muscle_id?: number | null
					secondary_muscle_ids?: number[] | null
				}
				Update: {
					difficulty?: Database['public']['Enums']['difficulty_level']
					exercise_name?: string | null
					id?: number
					primary_muscle_id?: number | null
					secondary_muscle_ids?: number[] | null
				}
				Relationships: [
					{
						foreignKeyName: 'exercises_primary_muscle_id_fkey'
						columns: ['primary_muscle_id']
						isOneToOne: false
						referencedRelation: 'muscle_groups'
						referencedColumns: ['id']
					}
				]
			}
			muscle_groups: {
				Row: {
					id: number
					name: string
				}
				Insert: {
					id?: number
					name?: string
				}
				Update: {
					id?: number
					name?: string
				}
				Relationships: []
			}
			workout_exercises: {
				Row: {
					exercise_id: number
					id: number
					workout_id: number
				}
				Insert: {
					exercise_id: number
					id?: number
					workout_id: number
				}
				Update: {
					exercise_id?: number
					id?: number
					workout_id?: number
				}
				Relationships: [
					{
						foreignKeyName: 'workout_exercises_exercise_id_fkey'
						columns: ['exercise_id']
						isOneToOne: false
						referencedRelation: 'exercises'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'workout_exercises_workout_id_fkey'
						columns: ['workout_id']
						isOneToOne: false
						referencedRelation: 'workouts'
						referencedColumns: ['id']
					}
				]
			}
			workouts: {
				Row: {
					description: string | null
					duration: number
					id: number
					name: string
					tag: Database['public']['Enums']['workout_tag'] | null
				}
				Insert: {
					description?: string | null
					duration: number
					id?: number
					name: string
					tag?: Database['public']['Enums']['workout_tag'] | null
				}
				Update: {
					description?: string | null
					duration?: number
					id?: number
					name?: string
					tag?: Database['public']['Enums']['workout_tag'] | null
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			difficulty_level: 'easy' | 'intermediate' | 'hard'
			workout_tag: 'push' | 'pull' | 'legs' | 'cardio'
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
	? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R
	  }
		? R
		: never
	: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I
	  }
		? I
		: never
	: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U
	  }
		? U
		: never
	: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
	? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
	: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
	? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
	: never

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			difficulty_level: ['easy', 'intermediate', 'hard'],
			workout_tag: ['push', 'pull', 'legs', 'cardio'],
		},
	},
} as const
