// profile.c

int main(object me, string arg)
{
        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

	seteuid(geteuid(me));

	PROFILE_D->make_profile(arg);
	write("Result written to /PROFILE\n");

	return 1;
}
int help (object me)
{
        write(@HELP
÷∏¡Ó∏Ò Ω: profile
 
turns on command profiling, the result will be saved to /PROFILE
 
HELP
);
        return 1;
}
