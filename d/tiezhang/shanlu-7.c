// Room: /u/zqb/tiezhang/shanlu-7.c
#include <ansi.h>

inherit ROOM;

string look_dazi();

void create()
{
	set("short", "山路");
	set("long", @LONG
你走在一条崎岖的山路上，道旁山峰壁立，长草过腰，中间一条羊肠小
路，仅容一人勉强过去。前面有一片茂密的松林。路旁的石壁上刻着几个大
字(dazi)。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
  "north" : __DIR__"sslin-1",
  "southdown" : __DIR__"shanlu-6",
]));

    set("item_desc",([
        "dazi"         :       (: look_dazi :),
    ]));
	set("no_clean_up", 0);
	set("outdoors", "tiezhang");

	setup();
}

string look_dazi()
{
        return
        "\n"
"    铁掌帮重地    \n"    
        "\n"
 "    擅入者----    \n"
RED"              死！    \n"NOR
        "\n";
}
