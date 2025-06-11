import { useEffect, useRef, useState } from "react";
import { EmployeeNameAndImageModel } from "../../models/EmployeeNameAndImageModel";

import './CustomDropdown.scss';
import { EmployeeImageDisplay } from "./EmployeeImageDisplay";


interface CustomDropdownProps {
  labelTitle?: string;
  employees: EmployeeNameAndImageModel[];
  setSelectedEmployeeId: (id: string) => void;
  handleEmployeeAction: (id: string) => void;
  placeholderText?: string;  
  resetTrigger?: boolean;
  initialEmployeeName?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  employees,  
  setSelectedEmployeeId, 
  handleEmployeeAction, 
  labelTitle,
  placeholderText,  
  resetTrigger, 
  initialEmployeeName,  
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the search term when the component first mounts or when initialEmployeeName changes
    if (initialEmployeeName) {
      setSearchTerm(initialEmployeeName);
    }
  }, [initialEmployeeName]);

  useEffect(() => {
    if (resetTrigger) {
      setSearchTerm("");
    }
  }, [resetTrigger]);

  const filteredEmployees = employees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.employeeId === employeeId);
    if (selectedEmployee) {
      setSearchTerm(`${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    }
    setSelectedEmployeeId(employeeId);
    handleEmployeeAction(employeeId); 
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      {labelTitle && <label htmlFor="selectedEmployeeId">{labelTitle}</label>}
      <div className="dropdown-container">
        <input
          type="text"
          id="selectedEmployeeId"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={placeholderText}
          autoComplete="off" 
        />
        {isDropdownOpen && (
          <ul className="dropdown-list">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <li key={employee.employeeId} onClick={() => handleSelect(employee.employeeId)}>
                  <EmployeeImageDisplay employee={employee}/>
                  <span>{employee.firstName} {employee.lastName}</span>
                </li>
              ))
            ) : (
              <li>No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};