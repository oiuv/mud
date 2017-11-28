inherit ROOM;

void create()
{
	set("short", "小屋");
	set("long", @LONG
这地方极是干燥，草木不生，屋中物品虽然经历了不知多
少年月，但大部仍然完好。厅上有一双女人的花鞋，色泽仍是
颇为鲜艳，想拿起来细看，哪知触手间登时化为灰尘，不由得
吓了一大跳。
LONG);

	set("exits", ([
		"south" : __DIR__"feixu2",
	]));

	setup();
	replace_program(ROOM);
}
