"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboardingStore } from "@/store/onboardingStore";

export function OnboardingController() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentStep, isActive, setActiveStep, markStepComplete, setTourActive } = useOnboardingStore();
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    // If no step is active or tour is paused, destroy current driver instance
    if (currentStep === null || !isActive) {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    // Delay initialization slightly to let the DOM settle, especially after navigation
    const timer = setTimeout(() => {
      // Setup the driver instance based on the active step and current route
      const d = driver({
        showProgress: false,
        allowClose: true,
        onDestroyStarted: () => {
          if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
          }
          setActiveStep(null);
          setTourActive(false);
        },
      });
      driverRef.current = d;

      // Logic for each step across pages
      switch (currentStep) {
        case 1: // Connect GitHub
          if (pathname === "/dashboard") {
            const el = document.getElementById("connect-github-btn");
            if (el) {
              d.highlight({
                element: "#connect-github-btn",
                popover: {
                  title: "Connect GitHub",
                  description: "Click here to link your GitHub account so you can sync repositories.",
                  side: "bottom",
                  align: "start"
                }
              });
            } else {
              // If button isn't there, they might already be connected. 
              // We could auto-complete this step.
              markStepComplete(1);
            }
          } else {
            router.push("/dashboard");
          }
          break;

        case 2: // Connect Repo (Create Project)
          if (pathname === "/dashboard") {
            const createBtn = document.getElementById("create-project-btn");
            if (createBtn) {
              // Highlight the create project button
              d.highlight({
                element: "#create-project-btn",
                popover: {
                  title: "Create a Project",
                  description: "Click here to create a new project and connect your repository.",
                  side: "bottom",
                  align: "start"
                }
              });
            } else {
              // If we are on dashboard but the create button isn't visible, 
              // maybe they need to click the projects tab first.
              d.highlight({
                element: "#tour-projects-tab",
                popover: {
                  title: "Go to Projects",
                  description: "Switch to the Projects tab to connect a repository.",
                  side: "bottom",
                  align: "start"
                }
              });
            }
          } else {
            router.push("/dashboard");
          }
          break;

        case 3: // Invite Teammates
          if (pathname.includes("/workspace")) {
            d.highlight({
              element: "#invite-member-btn",
              popover: {
                title: "Invite Teammates",
                description: "Click here to share an invite link with your team.",
                side: "bottom",
                align: "start"
              }
            });
          } else if (pathname === "/dashboard") {
            d.highlight({
              element: "#workspace-link-btn",
              popover: {
                title: "Open Workspace",
                description: "Open any of your project workspaces to invite teammates.",
                side: "top",
                align: "start"
              }
            });
          } else {
            router.push("/dashboard");
          }
          break;

        case 4: // Make a project deadline
          if (pathname.includes("/workspace")) {
            d.highlight({
              element: "#create-deadline-btn",
              popover: {
                title: "Set a Deadline",
                description: "Add a new sprint or deadline for your project.",
                side: "bottom",
                align: "start"
              }
            });
          } else {
             if (pathname === "/dashboard") {
               d.highlight({
                 element: "#workspace-link-btn",
                 popover: {
                   title: "Open Workspace",
                   description: "Enter a workspace to set a project deadline.",
                   side: "top",
                   align: "start"
                 }
               });
             } else {
               router.push("/dashboard");
             }
          }
          break;

        case 5: // Create first task
          if (pathname.includes("/workspace")) {
            d.highlight({
              element: "#create-task-btn",
              popover: {
                title: "Create a Task",
                description: "Click here to create your very first task.",
                side: "bottom",
                align: "start"
              }
            });
          } else {
            if (pathname === "/dashboard") {
              d.highlight({
                element: "#workspace-link-btn",
                popover: {
                  title: "Open Workspace",
                  description: "Enter a workspace to create a task.",
                  side: "top",
                  align: "start"
                }
              });
            } else {
              router.push("/dashboard");
            }
          }
          break;

        case 6: // Download Extension
          // We can highlight a placeholder or just open a link
          if (pathname === "/dashboard") {
            const extBtn = document.getElementById("download-extension-btn");
            if (extBtn) {
              d.highlight({
                element: "#download-extension-btn",
                popover: {
                  title: "Download Extension",
                  description: "Click here to view instructions for installing our VS Code extension.",
                  side: "bottom",
                  align: "start"
                }
              });
            }
          } else {
            router.push("/dashboard");
          }
          break;
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [currentStep, isActive, pathname, router, setActiveStep, setTourActive, markStepComplete]);

  return null; // This is a headless component
}
