inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
山路自东向西，地势渐平。云中有几头苍鹰在低低的盘旋
遨翔，仿佛将行人当作了猎物。路面铺着小石子，道两旁的灌
木越来越少，骄阳似火，令人真想找个地方休息一下。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"north" : "/d/gaochang/shulin1",
  		"westdown" : __DIR__"shamo1",
  		"eastdown" : __DIR__"caoyuan6",
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        if (! userp(me) && dir == "north")
                return notify_fail("高昌迷宮NPC立入禁止。\n");
        return ::valid_leave(me, dir);
}
