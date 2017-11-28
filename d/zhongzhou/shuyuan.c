inherit ROOM;

void create()
{
        set("short", "书院");
        set("long", @LONG
这是中州城南的一家书院，虽说这家书院不大，听说从这
里学有所成的人还不少，兵部尚书刘大人也在这里念过书。书
院里有几个人摇头晃脑正在念着四书五经。
LONG);

        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"wendingnan4",
	]));

        set("no_fight",1);
        setup();
}
