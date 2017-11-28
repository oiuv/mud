// Room: /d/mingjiao/xingtang.c

#include <ansi.h>
#include <login.h>

inherit ROOM;

void create()
{
	set("short", "刑堂");
	set("long", @LONG
整个刑堂门户紧闭，密不透风。即便是在白昼，也犹如黑
夜一般，每隔几步的墙上，点燃着几枝牛油巨烛。中间是一个
大火盆，烈焰腾腾。下方摆着一排排烙铁、水牛皮鞭、穿孔竹
板及狼牙棒等刑具。四周站满了手持兵刃的执法教众。他们正
用冷酷的眼神打量着你，令你不禁浑身哆嗦起来。
LONG );
	set("no_fight", "1");
	set("exits", ([
		"west" : __DIR__"square",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

