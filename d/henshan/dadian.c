inherit ROOM;

void create()
{
        set("short", "大殿");
        set("long", @LONG
这里是南岳大殿，供祭祀炎帝之用。大殿结构为重檐歇山
顶，顶覆七彩琉璃。殿高七十二尺，正面七间，有石柱七十二
根，合南岳七十二峰之数。殿中南岳圣帝宝相庄严。南岳庙之
雄为衡山小四绝之一。 
LONG);
        set("exits", ([
                "south"  : __DIR__"yushulou",
                "north"  : __DIR__"houdian",
        ]));

        set("objects", ([
                __DIR__"npc/xiangke"  : 1,
                __DIR__"npc/youke"    : 1,
        ]));    

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

