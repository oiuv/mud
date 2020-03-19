inherit ROOM;
void create()
{
        set("short", "居室");
        set("long", @LONG 
走进这里，出现在你眼前的是大大小小的药罐。在这里住的
是凌霄城的六代弟子张万风，他为人厚道，所以白自在放心地把
管理凌霄城一些稀世药物的任务交给了他。不过据说他跟王万仞
向来交好，经常把一些珍贵的药酒给那家伙喝。
LONG);
        set("exits",([
            	"north"  : __DIR__"zoulang2", 
        ]));
        set("objects", ([  
                CLASS_D("lingxiao") + "/zhangwanfeng" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

