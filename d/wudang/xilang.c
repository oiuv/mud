inherit ROOM;

void create()
{
        set("short", "西厢走廊");
        set("long", @LONG
你走在一条走廊上，东边是大殿，北边是一座楼阁。西面
楼上传来阵阵打斗声。
LONG );
        set("exits", ([
                "northup" : __DIR__"cangjingge",
                "east"    : __DIR__"sanqingdian",
                "westup"  : __DIR__"caolianfang",
        ]));
        setup();
        replace_program(ROOM);
}
