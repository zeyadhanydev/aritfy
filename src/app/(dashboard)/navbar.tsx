import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@/features/auth/components/user-button";

export const Navbar = () => {
	return (
		<nav className="w-full flex items-center p-4 h-[68px]">
			<div className="ml-auto flex items-center gap-x-4">
				<ModeToggle />
				<UserButton></UserButton>
			</div>
		</nav>
	);
};
