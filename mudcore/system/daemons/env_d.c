/*****************************************************************************
Copyright: 2021, Mud.Ren
File name: env_d.c
Description: 游戏配置守护进程
Author: xuefeng
Version: v1.0
Date: 2021-04-01
说明：游戏中自定义配置的存取，推荐直接使用env(key, void | value)来读或写配置
*****************************************************************************/
inherit CORE_DBASE;

#define CONFIG_FILE DATA_DIR ".env"

void create()
{
    string *cfg = read_lines(CONFIG_FILE);
    string key;
    mixed value;

    foreach (string line in cfg)
    {
        if (sscanf(line, "%s:%s", key, value) == 2)
        {
            key = trim(key);
            value = trim(value);

            if (value == "true")
            {
                value = 1;
            }
            else if (value == "false")
            {
                value = 0;
            }
            else if (is_numeric(value))
            {
                value = atoi(value);
            }

            set(key, value);
        }
    }
}
