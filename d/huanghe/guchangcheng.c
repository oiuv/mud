#include <ansi.h>
inherit RIVER;

void create()
{
	set("short", "古长城");
	set("long", @LONG
这里是一段古长城。相传是当年秦始皇派他的心腹爱将蒙
恬率三十万大军所修。世事变迁、沧海桑田，如今这里已是片
废墟，唯一依稀可见的是夯土制成的烽火台象个小土包一样矗
立在那里。黄河从西向东流去，河上(river)有一叶小舟。
LONG);
        set("arrive_room", "/d/lingzhou/xuanhebao");
	set("exits", ([
		"southwest" : __DIR__"yinpanshui",
		"southeast" : __DIR__"shimen",
	]));
	set("objects", ([
		__DIR__"npc/menmian" :1,
	]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

	set("outdoors", "huanghe");
	setup();
        replace_program(RIVER);
}
