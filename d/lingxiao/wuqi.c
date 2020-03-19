inherit ROOM;

void create()
{
        set("short", "打铁铺");
        set("long", @LONG
这就是凌霄城的刀剑铺。走进这里，寒气侵体，好象比外面
还要冷。仔细一看，墙上挂满了大大小小、形形色色的刀剑，一
柄柄寒光闪闪，全是上品。店主轩辕苍翼看到有人进来，立刻殷
勤地迎上前来。
LONG );
        set("exits", ([
                "east" : __DIR__"iceroad2",
        ]));
        set("objects", ([
                "/d/luoyang/npc/smith": 1,
        ]));
        setup();
        replace_program(ROOM);
}

