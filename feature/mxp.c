void mxp_enable()
{
    receive("<MXP negotiation enabled>\n");
}

void mxp_tag(string command)
{
    receive("<MXP TAG: " + command + ".>\n");
}

void act_mxp()
{
    efun::act_mxp();
}
