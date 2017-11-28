inherit ROOM;

void create()
{
        set("short", "望日台");
        set("long", @LONG
望日台紧邻祝融殿。鸡鸣夜起，登台东望，遥见海门，云
水皆赤，倏忽异彩，日轮荡漾，若沉若浮，稍之奋涌而起，光
耀夺目。
LONG);
        set("exits", ([
                "southdown"  : __DIR__"shiziyan",
                "northup"    : __DIR__"zhurongdian",
        ]));

        set("objects", ([
                __DIR__"npc/youke"    : 2,
        ]));    

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

