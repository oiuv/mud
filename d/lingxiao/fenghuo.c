inherit ROOM;

void create()
{
        set("short", "风火居");
        set("long", @LONG
这里是凌霄双杰之一—封万里的房间。房间混乱不堪，到处
都是刀剑砍凿的痕迹，好象被谁在这发泄过怒火似的。一名手持
长剑，少了一臂，而偏又面带怒色的中年男子，站在屋中，凝望
窗外，正牙关紧咬,似有无限恨事。
LONG);
        set("exits", ([
            	"west" : __DIR__"houyuan2", 
        ]));
        set("objects", ([  
                __DIR__"npc/feng" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

