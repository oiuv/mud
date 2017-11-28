// bboard.c

#include <ansi.h>

#define BOARD_CAPACITY query("capacity")

inherit ITEM;
inherit F_SAVE;

void setup()
{
	string loc;

	if (stringp(loc = query("location")))
		move(loc);
	set("no_get", 1);
	restore();
}

void init()
{
	add_action("do_post", "post");
	add_action("do_read", "read");
	add_action("do_discard", "discard");
}

string query_save_file()
{
	string id;

	if (! stringp(id = query("board_id"))) return 0;
	return DATA_DIR + "board/" + id;
}

string short()
{
	mapping *notes;
	int i, unread, last_read_time;

	notes = query("notes");
	if (! pointerp(notes) || ! sizeof(notes))
		return ::short() + " [ 没有任何留言 ]";

	if (this_player())
        {
		last_read_time = (int)this_player()->query("board_last_read/" +
                                 (string)query("board_id"));
		for(unread = 0, i=sizeof(notes)-1; i>=0; i--, unread ++)
			if( notes[i]["time"] <= last_read_time ) break;
	}
	if (unread)
		return sprintf(HIC + "%s" + NOR + " [ %d 张留言，" + HIY + "%d" + NOR + " 张" +
                               HIR + "未读" + NOR + "]", ::short(), sizeof(notes), unread);
	else
		return sprintf("%s [ %d 张留言 ]", ::short(), sizeof(notes));
}

string long()
{
	mapping *notes;
	int i, last_time_read;
	string msg/*, myid*/;
        object where;

        where = environment(this_player());

        if ((string)file_name(where) == "/d/wizard/noname_room"
            && !wizardp(this_player()))
                return "该留言版只有巫师才能查阅。\n";  

	notes = query("notes");
	msg = query("long");
	msg = msg + "留言版的使用方法请见 help board。\n";
	if (! pointerp(notes) || ! sizeof(notes)) return query("long");

	last_time_read = this_player()->query("board_last_read/" + (string)query("board_id"));
        i = sizeof(notes) - 50;
        if (i < 0) i = 0;
	for (; i < sizeof(notes); i++)
		msg += sprintf("%s[%2d]" NOR "  %-40s %12s (%s)\n",
			(notes[i]["time"] > last_time_read ? HIY: ""),
			i + 1, notes[i]["title"], notes[i]["author"], ctime(notes[i]["time"])[0..15]);
	return msg;
}

// This is the callback function to process the string returned from the
// editor defined in F_EDIT of player object.
void done_post(object me, mapping note, int n, string text)
{
        int i;
//      int t;
        int pl;
        string sign;
        string pure;
	mapping *notes;

        if (! n) n = me->query("env/default_sign");
        if (! stringp(sign = me->query(sprintf("env/sign%d", n))))
        {
                // auto select the first none null sign
                for (i = 1; i <= 4; i++)
                {
                        sign = me->query(sprintf("env/sign%d", i));
                        if (stringp(sign)) break;
                }
        }

        if (stringp(sign))
        {
                sign = replace_string(sign, "\\n", "\n");
                sign = trans_color(sign, 1);
                pure = filter_color(sign);
                if (strlen(pure) >= 1 &&
		    pure[strlen(pure) - 1] != '\n')
			sign += "\n";

                pure = filter_color(text);
                pl = strlen(pure);
                if (pl >= 1 && pure[pl - 1] != '\n')
                        text += "\n\n" + sign;
                else
                if (pl >= 2 && pure[pl - 2] != '\n')
                        text += "\n" + sign;
                else
                        text += sign;
        }

	note["msg"] = text;
	notes = query("notes");
	if (! pointerp(notes) || ! sizeof(notes))
		notes = ({ note });
	else
        {
                i = sizeof(notes) - 1;
                if (note["time"] <= notes[i]["time"])
                        note["time"] = notes[i]["time"] + 1;
		notes += ({ note });
        }

	// Truncate the notes if maximum capacity exceeded.
	if (sizeof(notes) > BOARD_CAPACITY)
		notes = notes[BOARD_CAPACITY / 2 .. BOARD_CAPACITY];

	set("notes", notes);
	tell_object(me, "留言完毕。\n");

	save();
	return;
}

int do_post(string arg, int n)
{
	mapping note;
	if (! arg) return notify_fail("留言请指定一个标题。\n");

        if (sscanf(arg, "%s with %d", arg, n) != 2)
                n = 0;

        if (replace_string(arg, " ", "") == "")
                arg = "无标题";
	
	note = allocate_mapping(4);
	note["title"] = arg;
	note["author"] = this_player()->query("name") + "-" + this_player()->query("id");
	note["time"] = time();
	this_player()->edit((: done_post, this_player(), note, n :));
	return 1;
}

int do_read(string arg)
{
	int num;
	mapping *notes, last_read_time;
	string myid;
        object where;

        where = environment(this_player());

        if ((string)file_name(where) == "/d/wizard/noname_room"
            && !wizardp(this_player()))
                return notify_fail("该留言版只有巫师才能查阅。\n");        

	last_read_time = this_player()->query("board_last_read");
	myid = query("board_id");
	notes = query("notes");

	if (! pointerp(notes) || ! sizeof(notes))
		return notify_fail("留言板上目前没有任何留言。\n");

	if (! arg) return notify_fail("指令格式：read <留言编号>|new|next\n");
	if (arg == "new" || arg == "next")
        {
		if (! mapp(last_read_time) || undefinedp(last_read_time[myid]))
			num = 1;
		else
			for (num = 1; num<=sizeof(notes); num++)
				if (notes[num-1]["time"] > last_read_time[myid])
                                        break;
			
	} else
        if (! sscanf(arg, "%d", num))
		return notify_fail("你要读第几张留言？\n");

	if (num < 1 || num > sizeof(notes))
		return notify_fail("没有这张留言。\n");
	num--;
	this_player()->start_more(sprintf(
"[%d] %-40s %s(%s)\n----------------------------------------------------------------------\n",
		num + 1, notes[num]["title"], notes[num]["author"], ctime(notes[num]["time"])[0..9])
		+ notes[num]["msg"]);

	// Keep track which post we were reading last time.
	if (! mapp(last_read_time))
		this_player()->set("board_last_read", ([ myid: notes[num]["time"] ]));
	else 
		if (undefinedp(last_read_time[myid]) || notes[num]["time"] > last_read_time[myid])
			last_read_time[myid] = notes[num]["time"];

	return 1;
}


int do_discard(string arg)
{
	mapping *notes;
	int num;

	if (! arg || sscanf(arg, "%d", num) != 1)
		return notify_fail("指令格式：discard <留言编号>\n");
	notes = query("notes");
	if (! arrayp(notes) || num < 1 || num > sizeof(notes))
		return notify_fail("没有这张留言。\n");
	num--;
	if (notes[num]["author"] != (string) this_player()->query("name") + "-" +
                                    this_player()->query("id")
	&&	(string)SECURITY_D->get_status(this_player()) != "(admin)" 
	&&      (string)SECURITY_D->get_status(this_player()) != "(arch)")
		return notify_fail("这个留言不是你写的。\n");

	notes = notes[0..num-1] + notes[num+1..sizeof(notes)-1];
	set("notes", notes);
	save();
	write("删除第 " + (num+1) + " 号留言....Ok。\n");
	return 1;
}