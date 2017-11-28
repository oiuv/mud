inherit  ROOM;

void  create  ()
{
	set("short",  "函谷关");
	set("long",  @LONG
这里就是古函古关。它东起崤山，西接潼津，关设谷中。当年强秦一
隅之地，制关东六国而不敢稍动，最后横扫天下，就是因为它据此，进可
攻，退可守，乃天下形胜之处。老子西出化胡，也是在此留下两册道德经，
千载以下，后人仍研读不尽。
LONG);
	set("exits",  ([
		"southeast"  :  __DIR__"road1",
		"west"  :  "/d/luoyang/guandaoe4",
	]));
	set("outdoors", "luoyang");
        set("objects", ([
                 __DIR__"npc/tianlong" : 1,
        ]));

	setup();
	replace_program(ROOM);
}
