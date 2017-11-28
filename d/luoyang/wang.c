inherit ROOM;

void create()
{
	set("short", "金刀王家");
	set("long", @LONG
这里便是洛阳金刀王家的府邸，江湖上提起金刀无敌王元霸当真是无
人不知，无人不晓。只见这府邸房舍高大，朱红漆的大门，门上两个大铜
环，擦得晶光雪亮，八名壮汉垂手在大门外侍候。一进大门，只见梁上悬
着一块黑漆大匾，写着“见义勇为”四个金字，下面落款是河南省的巡抚
某人。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"wroad3",
	]));
        set("objects", ([
                "/d/zhongzhou/npc/jiading" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
