inherit ROOM;

void create()
{
	set("short", "北帝庙");
	set("long", @LONG
北帝庙坐北朝南。院子中一个大水塘，塘中石龟石蛇，昂
然盘踞。大殿神像石板上血迹殷然。北帝神像立于大殿的正中。
LONG);
	set("exits", ([
	        "south"  : __DIR__"street1",
	]));
	setup();
	replace_program(ROOM);
}

