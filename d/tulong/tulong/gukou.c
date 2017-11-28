inherit ROOM;
void create()
{
        set("short","山谷口");
        set("long", @LONG
进得谷口，只见一片青草地上摆着七八张方桌，除了东首第一席外，每张桌
旁都已坐了人。各门各派的掌门、帮主都在里面了。
LONG );
        set("no_fight",1);
        set("exits",([
                "west":"/d/tulong/tulong/daobian",
                "east":"/d/tulong/tulong/huichang",
        ]));

setup();
}

