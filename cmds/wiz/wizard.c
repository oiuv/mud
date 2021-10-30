inherit F_CLEAN_UP;

int main(object me, string arg)
{
    function f;

    if (!SECURITY_D->valid_grant(me, "(wizard)"))
        return 0;

    if (wizardp(me))
    {
        f = bind((: disable_wizard :), me);
        write("disable_wizard!\n");
    }
    else
    {
        f = bind((: enable_wizard :), me);
        write("enable_wizard!\n");
    }

    evaluate(f);

    return 1;
}
