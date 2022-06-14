// driver 启动测试
void flag(string str)
{
    switch (str)
    {
    case "debug":
        store_variable("DEBUG", 1);
        break;
    default:
        write("[CORE_MASTER_OB]->flag():The only supproted flag is 'debug', got '" + str + "'.\n");
    }
    // otherwise wait for auto shutdown
}
