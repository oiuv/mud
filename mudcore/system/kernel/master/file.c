
string creator_file(string str)
{
    // debug_message("[CORE_MASTER_OB]->creator_file():" + str);
    return (string)call_other(__DIR__ "simul_efun", "creator_file", str);
}

string domain_file(string str)
{
    // debug_message("[CORE_MASTER_OB]->domain_file():" + str);
    return (string)call_other(__DIR__ "simul_efun", "domain_file", str);
}

string author_file(string str)
{
    // debug_message("[CORE_MASTER_OB]->author_file():" + str);
    return (string)call_other(__DIR__ "simul_efun", "author_file", str);
}

string privs_file(string file)
{
    return file;
}
