inherit ROOM;

void create()
{
        set("short", "元大都城中心");
        set("long", @LONG
这里是元大都城的中心，也就是后来北京城的前身。灰色的城墙给人以庄严
肃穆之感，远远望去，城楼的轮廓益发显得雄伟高大，一条护城河绕城而过。
LONG );
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg",1);

        set("objects", ([
                "/d/beijing/npc/maiyi1" : 1,
                "/d/beijing/npc/old2" : 1,
                "/d/beijing/npc/kid1" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}


