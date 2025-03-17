export interface history { 
    problem_id: number; 
    maker_id: string; 
    title: string; 
    description: string;  
    testcase?: string[]; 
    parent_problem_id: number; 
    root_problem_id: number;
    tags : string[], 
    enable: boolean,
    
}
