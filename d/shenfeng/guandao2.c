inherit ROOM;
void create()
{
	set("short", "塞口");
	set("long", @LONG
这里是中原入西域的必经之路，大批的商人鸵队都一定要
从这里经过，形成了这里的畸形路容。向西你可以看到一段破
旧的长城，上面好象还有被土炮轰过的痕迹，向北是一家小店。
龙门客栈的木板招牌孤零零的在寒风中摇曳。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"guandao3",
  		"north" : __DIR__"longmen",
  		"east" : __DIR__"guandao1",
	]));
	setup();
	replace_program(ROOM);
}
