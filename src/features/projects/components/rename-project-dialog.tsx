"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProject } from "@/features/projects/api/use-update-project";

interface RenameProjectDialogProps {
	projectId: string;
	currentName: string;
	isOpen: boolean;
	onClose: () => void;
}

export const RenameProjectDialog = ({
	projectId,
	currentName,
	isOpen,
	onClose,
}: RenameProjectDialogProps) => {
	const [name, setName] = useState(currentName);
	const mutation = useUpdateProject(projectId);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedName = name.trim();
		if (!trimmedName) {
			toast.error("Project name cannot be empty");
			return;
		}

		if (trimmedName === currentName) {
			onClose();
			return;
		}

		mutation.mutate(
			{ name: trimmedName },
			{
				onSuccess: () => {
					toast.success("Project renamed successfully");
					onClose();
				},
			},
		);
	};

	const handleClose = () => {
		if (!mutation.isPending) {
			setName(currentName);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename Project</DialogTitle>
					<DialogDescription>
						Enter a new name for your project.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter project name..."
							disabled={mutation.isPending}
							autoFocus
							maxLength={100}
						/>
					</div>
					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={mutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={mutation.isPending || !name.trim()}>
							{mutation.isPending ? "Renaming..." : "Rename"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
