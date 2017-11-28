// Room: /u/zqb/tiezhang/shanlu-2.c

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
你走在一条崎岖的山路上，道旁山峰壁立，长草过腰，中间一条羊肠小
路，仅容一人勉强过去。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
  "north" : __DIR__"guangchang.c",
  "south" : __DIR__"shanlu-1.c",
]));
	set("no_clean_up", 0);
   set("objects", ([ /* sizeof() == 3 */
      __DIR__"npc/huiyi" : 2, ]));
	set("outdoors", "tiezhang");

	setup();
	replace_program(ROOM);
}
