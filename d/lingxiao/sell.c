inherit ROOM;

void create()
{
        set("short", "水晶当");
        set("long", @LONG 
这里是凌霄城的大当铺--水晶当。它名叫水晶当，不仅是因
为它的招牌是水晶所制，更重要的是它的信誉鼎然，在凌霄城中
名声向来不错。所以人称“水晶当”。老板陈朝奉，正坐在柜台
后，笑嘻嘻地同客人讨价还价。
LONG);
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg",1);
        set("item_desc", ([
                "paizi" : "水晶招牌，童叟无欺\n
sell        卖 
buy         买
redeem      赎
value       估价
",
        ]));
        set("objects", ([
                __DIR__"npc/laoban" : 1,
        ]));
        set("no_clean_up", 0);
        set("exits", ([
                "west" : __DIR__"iceroad1",
        ]));

        setup();
        replace_program(ROOM);
}

