inherit ROOM;
 
void create()
{
        set("short", "天香堂厢房");
        set("long",@LONG
偏厅布置的颇为优雅，丝毫没有正厅上的严肃气氛。一张
红木大桌边上有个书柜，柜里摆了各式各样的书。墙上挂着几
幅字画。堂的一边摆着几张大床，让人看了就想睡觉。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("no_clean_up", 0);
        set("exits", ([
            	"west"   : __DIR__"tian1",
        ]));
        set("objects", ([
                __DIR__"npc/dizi6" : 1,
        ]));       
        setup();
        replace_program(ROOM);
}
