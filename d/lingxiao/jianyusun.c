inherit ROOM;

void create()
{
        set("short", "牢房");
        set("long", @LONG
这是一间小小的牢房，是一间丈许见方的石室。地下高低不
平，都是巨石。你睁大眼睛四下察看，只见左角落里略有微光透
入，凝目看去，是个不到一尺见方的洞穴，猫儿或可出入，却连
小狗也钻不过去，是送饭时用的小孔。
LONG );
        set("no_clean_up", 0);

        set("exits", ([
                "east" : __DIR__"laolang",
        ]));
        set("objects", ([ 
                __DIR__"npc/sun" : 1,
        ])); 
        setup(); 
        replace_program(ROOM);
}

