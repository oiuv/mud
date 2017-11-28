inherit ROOM;

void create()
{
        set("short", "六盘山");
        set("long", @LONG
这是一座不太高的小山。山顶望去，瓦蓝的天空飘着几朵
淡淡的白云。一群大雁发出「嘎嘎」的叫声，从头上飞过。西
面山下长城的残垣断壁依稀可辨。长城的尽头是一座雄伟的关
隘。路旁有一处悬崖之上刻着首词。
LONG);
        set("exits", ([
            "westdown" : __DIR__ "jiayuguan",
            "east" : "/d/lanzhou/ximen",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "xingxiu");

        setup();
        replace_program(ROOM);
}

