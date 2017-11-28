inherit ROOM;
#include <ansi.h>

void create()
{
    set("short", "大厅");
    set("long", 
"这里是桃花山庄的正厅。整个大厅十分宽阔。厅中更挂满\n"
"了各种名家的书法真迹。但最为显眼的却是正中挂的一幅对联：\n\n"
HIC "           ※※※※※※※※※※※※※※※\n"
"           ※                          ※\n"
"           ※   " HIW "桃 花 影 落 飞 神 剑" HIC  "   ※\n"
"           ※                          ※\n"
"           ※   " HIW "碧 海 潮 生 按 玉 箫" HIC  "   ※\n"
"           ※                          ※\n"
"           ※※※※※※※※※※※※※※※\n\n" NOR
"其字体遒劲挺拔，气势宏伟之极，想必应是出自黄药师的手笔。\n"
);
	set("exits", ([
	    "north" : __DIR__"qianyuan",
	    "south" : __DIR__"houyuan",
	    "east"  : __DIR__"daojufang",
	    "west"  : __DIR__"wofang" ,
	]));
	set("objects", ([
	    "/kungfu/class/taohua/huang" : 1,
	]) );    
	set("valid_startroom", 1);
	set("no_beg", "1");
	setup();

	 "/clone/board/taohua_b"->foo();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("huang yaoshi", this_object())))
                return 1;

        if (dir == "south" || dir == "east")
                return guarder->permit_pass(me, dir);

        return 1;
}
