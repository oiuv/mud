// newsd.c

#include <ansi.h>
#include <getconfig.h>

// #pragma optimize
// #pragma save_binary

inherit F_SAVE;
inherit F_DBASE;

// 最多一千条新闻
#define MAX_NEWS_CAPACITY       1000

void create()
{
        seteuid(getuid());
        restore();
}

void remove()
{
        save();
}

void mud_shutdown()
{
        save();
}

// prompt user
void prompt_user(object me)
{
        int num;
        int total;
        mapping *notes;
        int last_read_time;

        last_read_time = me->query("last_read_news");
        if (! last_read_time)
        {
                tell_object(me, HIG "\n欢迎您进入" + LOCAL_MUD_NAME() +
                                HIG "，今后请使用" HIY " news " HIG
                                "命令查阅发布的新闻信息。\n" NOR);
                me->set("last_read_news", time());
                return;
        }

        notes = query("notes");

        if (! pointerp(notes) || ! sizeof(notes))
                return;

        num = sizeof(notes);
        total = 0;
        while (num--)
                if (notes[num]["time"] > last_read_time)
                        total++;
                else
                        break;

        if (! total)
                tell_object(me, WHT "\n你目前没有未曾阅读过的新闻。\n" NOR);
        else
                tell_object(me, WHT "\n你目前一共有" HIY + chinese_number(total) +
                                NOR + WHT "条新闻还没有阅读，请使用(" HIY "news"
                                NOR + WHT ")命令阅读。\n" NOR);

        // 开始定时通知
        if (previous_object() == find_object(LOGIN_D))
                me->start_call_out(bind((: call_other, __FILE__, "auto_notice",
                                           me :), me), 10 + random(10));
}

// show all the news's title
// raw = 1: only show the non-read news
void show_news(object me, int raw)
{
        mapping *notes;
        int i, last_time_read;
        string msg;

        notes = query("notes");
        if (! pointerp(notes) || ! sizeof(notes))
        {
                tell_object(me, "目前没有任何新闻。\n");
                return;
        }

        msg = WHT "目前武林中的最新消息如下。\n"
              HIC "≡" HIY "───────────────────"
              "───────────────────" HIC "≡\n" NOR;
        last_time_read = me->query("last_read_news");
        i = sizeof(notes);
        while (i--)
        {
                if (raw && (notes[i]["time"] <= last_time_read))
                        break;

                msg += sprintf("%s [%3d]" NOR " %-" + (40 + color_len(notes[i]["title"])) +
                               "s %s" WHT "『 " CYN "%s" NOR + WHT " 』" NOR "\n",
                               (notes[i]["time"] > last_time_read ? HIY : ""),
                               i + 1, notes[i]["title"],
                               notes[i]["author"], ctime(notes[i]["time"])[0..9]);
        }

        if (i == sizeof(notes) - 1)
        {
                tell_object(me, WHT "武林中总共发布过" HIY +
                                chinese_number(sizeof(notes)) + NOR +
                                WHT "条新闻，目前没有任何未读过的新闻。\n" NOR);
                return;
        }

        msg += HIC "≡" HIY "──────────────────"
               "────────────────────" HIC "≡\n" NOR;

        me->start_more(msg);
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

        text = color_filter(text) + NOR;

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
        if (sizeof(notes) > MAX_NEWS_CAPACITY)
                notes = notes[MAX_NEWS_CAPACITY / 4 .. MAX_NEWS_CAPACITY];

        set("notes", notes);
        tell_object(me, "新闻发布完毕。\n");

        shout(HIR "【江湖传闻】" NOR + WHT + me->name() + WHT "[" +
              me->query("id") + WHT "]发布了一条新闻。\n" NOR);
        save();
}

// post a news
void do_post(object me, string arg)
{
        int n;
        mapping note;

        if (! VERSION_D->is_release_server())
        {
                tell_object(me, "只有在版本发布的站点才能发布新闻。\n");
                return;
        }

        if (! wizardp(me) || ! interactive(me))
        {
                tell_object(me, "只有巫师才能发布新闻。\n");
                return;
        }

        if (! arg)
        {
                tell_object(me, "发布新闻请指定一个标题。\n");
                return;
        }

        if (sscanf(arg, "%s with %d", arg, n) != 2)
                n = 0;

        if (replace_string(arg, " ", "") == "")
                arg = "无标题";
        else
                arg = color_filter(arg) + NOR;

        note = allocate_mapping(4);
        note["title"] = arg;
        note["author"] = me->name(1) + "-" + me->query("id");
        note["time"] = time();
        me->edit(bind((: call_other, __FILE__, "done_post", me, note, n :), me));
}

// read a news
void do_read(object me, string arg)
{
        int num;
        mapping *notes;
        int last_read_time;

        last_read_time = me->query("last_read_news");
        notes = query("notes");

        if (! pointerp(notes) || ! sizeof(notes))
        {
                tell_object(me, "目前没有任何新闻。\n");
                return;
        }

        if (! arg)
        {
                tell_object(me, "你想读那一条新闻？\n");
                return;
        }

        if (arg == "new" || arg == "next")
        {
                if (! last_read_time)
                        num = 1;
                else
                        for (num = 1; num <= sizeof(notes); num++)
                                if (notes[num - 1]["time"] > last_read_time)
                                        break;
        } else
        if (! sscanf(arg, "%d", num))
        {
                tell_object(me, "你要读第几条新闻？\n");
                return;
        }

        if (num < 1 || num > sizeof(notes))
        {
                tell_object(me, "没有这条新闻。\n");
                return;
        }
        num--;
        me->start_more(sprintf(HIC "≡" HIY "──────────────────"
                               "────────────────────" HIC "≡\n"
                               NOR " [%d] %-" + (40 + color_len(notes[num]["title"])) +
                               "s %s" WHT "『 " CYN "%s" NOR + WHT " 』\n" HIC "≡"
                               HIY "───────────────────────"
                               "───────────────" HIC "≡\n\n" NOR,
                               num + 1, notes[num]["title"], notes[num]["author"],
                               ctime(notes[num]["time"])[0..9]) + notes[num]["msg"]);

        // Keep track which post we were reading last time.
        if (notes[num]["time"] > (int)last_read_time)
                me->set("last_read_news", notes[num]["time"]);
}

// discard a news
void do_discard(object me, string arg)
{
        mapping *notes;
        int num;
        string author, aid;

        if (! arg || sscanf(arg, "%d", num) != 1)
        {
                tell_object(me, "你想去掉拿一条新闻？\n");
                return;
        }

        notes = query("notes");
        if (! arrayp(notes) || num < 1 || num > sizeof(notes))
        {
                tell_object(me, "没有这条新闻。\n");
                return;
        }

        num--;

        if ((! stringp(author = notes[num]["author"]) ||
             sscanf(author, "%*s-%s", aid) != 2 ||
             aid != me->query("id")) &&
            (string)SECURITY_D->get_status(me) != "(admin)")
        {
                tell_object(me, "只有天神才能去掉他人发布的新闻。\n");
                return;
        }

        notes = notes[0..num - 1] + notes[num + 1..sizeof(notes) - 1];
        set("notes", notes);
        save();
        tell_object(me, "你删除了第 " + (num + 1) + " 条新闻。\n");
}

// auto notice user
void auto_notice(object me)
{
        int num;
        mapping *notes;
        string msg;
        int last_read_time;

        if (! objectp(me))
                return;

        last_read_time = me->query("last_read_news");
        notes = query("notes");

        if (! pointerp(notes) || ! sizeof(notes))
                return;

        num = sizeof(notes) - 1;
        if (notes[num]["time"] <= last_read_time)
                return;

        // some news need read, start next call out
        me->start_call_out(bind((: call_other, __FILE__, "auto_notice",
                                   me :), me), 30 + random(30));

        if (! living(me) || me->query_temp("block_msg/all"))
                return;

        while (num-- > 0)
        {
                if (notes[num]["time"] <= last_read_time)
                {
                        num++;
                        break;
                }

                // contine to find next
        }

        if (num < 0) num = 0;

        msg = WHT "\n在你离线期间「" HIY "武林群侠传" NOR +
              WHT "」有过更新，请认真阅读以下新闻。\n\n" NOR;
        tell_object(me, msg);
        me->start_more(sprintf(" [%d] %-" + (40 + color_len(notes[num]["title"])) +
                               "s %s" WHT "『 " CYN "%s" NOR + WHT " 』\n" HIC "≡"
                               HIY "───────────────────────"
                               "───────────────" HIC "≡\n" NOR,
                               num + 1, notes[num]["title"], notes[num]["author"],
                               ctime(notes[num]["time"])[0..9]) + notes[num]["msg"]);

        // Keep track which post we were reading last time.
        if (notes[num]["time"] > (int)last_read_time)
                me->set("last_read_news", notes[num]["time"]);
        tell_object(me, "\n");
}

string query_save_file() { return DATA_DIR "newsd"; }
