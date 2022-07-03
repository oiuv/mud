// 游戏系统安全保护系统相关方法

string get_root_uid()
{
    return ROOT_UID;
}

string get_bb_uid()
{
    return BACKBONE_UID;
}

string creator_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "creator_file", str);
}

string domain_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "domain_file", str);
}

string author_file(string str)
{
    return (string)call_other(SIMUL_EFUN_OB, "author_file", str);
}
