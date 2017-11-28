inherit ROOM;

void create()
{
        set("short", "正厅");
        set("long", @LONG
这里是红花会总舵内的正厅，大厅相当的宽敞明亮，四周
的墙上悬挂满了各朝名人的真迹。只见一位三十多岁的汉子站
在厅中，甚是威猛，让人肃然起敬。他旁边站着几个红花会会
众，赤裸着上身，胸前佩着一朵大红花，神情严肃。
LONG);
        set("exits", ([
  		"west" : __DIR__"hh_zoulang4",
  		"east" : __DIR__"hh_zoulang5",
  		"north" : __DIR__"hh_houting",
  		"south" : __DIR__"hh_qianting",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/wen" : 1,
                __DIR__"npc/honghua1" : 4,
        ]));
        set("no_clean_up", 0);
        set("valid_startroom", 1);
        setup();
        "/clone/board/honghua_b"->foo();
}

int valid_leave(object me, string dir)
{
        object wen;

        if (dir != "east" &&
            dir != "west" &&
            dir != "north" ||
            ! objectp(wen = present("wen tailai", this_object())))
                return ::valid_leave(me, dir);

        return wen->permit_pass(me, dir);
}
