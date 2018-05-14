// news cmds
// by Doing
#include <ansi.h>
 
inherit F_CLEAN_UP;

#ifndef NEWS_D
#define NEWS_D          "/adm/daemons/newsd"
#endif

int main(object me, string arg)
{
        if( !wizardp(me) && time()-query_temp("last_news", me)<3 )
        {
                write("系统气喘嘘地叹道：慢慢来 ....\n");  
                return 1;
        }

        set_temp("last_news", time(), me);

        if (! arg || arg == "" || arg == "all")
        {
                NEWS_D->show_news(me, (arg != "all") ? 1 : 0);
                write(HIC "阅读新闻指令格式：" HIY "news " NOR "<" HIY "new" NOR "|" HIY "新闻编号" NOR ">\n"
                      HIC "搜索新闻指令格式：" HIG "news search " NOR "<" HIG "title" NOR "|" HIG "document" NOR "> <" HIM "关键字" NOR "|" HIM "关键词" NOR ">\n");
                return 1;
        }

        if (sscanf(arg, "discard %s", arg) || sscanf(arg, "del %s", arg))
        {
                NEWS_D->do_discard(me, arg);
                return 1;
        }

        if (sscanf(arg, "post %s", arg) || sscanf(arg, "add %s", arg))
        {
                NEWS_D->do_post(me, arg);
                return 1;
        }

        if (sscanf(arg, "search %s", arg) || sscanf(arg, "find %s", arg))
        {
                NEWS_D->do_search(me, arg);
                write(HIC "阅读新闻指令格式：" HIY "news " NOR "<" HIY "new" NOR "|" HIY "新闻编号" NOR ">\n"
                      HIC "搜索新闻指令格式：" HIG "news search " NOR "<" HIG "title" NOR "|" HIG "document" NOR "> <" HIM "关键字" NOR "|" HIM "关键词" NOR ">\n");
                return 1;
        }

        NEWS_D->do_read(me, arg);
        write(HIC "阅读新闻指令格式：" HIY "news " NOR "<" HIY "new" NOR "|" HIY "next" NOR "|" HIY "新闻编号" NOR ">\n"
              HIC "搜索新闻指令格式：" HIG "news search " NOR "<" HIG "title" NOR "|" HIG "author" NOR "|" HIG "document" NOR "> <" HIM "关键字" NOR "|" HIM "关键词" NOR ">\n");
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : news [<新闻编号>] | new | all
           news search <title|document> <关键字|关键词>

这条指令让你你可以阅读游戏中的新闻。所有的更新和消息都是通过
新闻发布的。

使用 new 参数可以让你阅读还没有读过的新闻。
使用 all 参数可以让你查看系统目前所有的新闻。
使用 search 参数可以让你查找系统目前符合搜索条件的新闻。
     search <title|document> <关键字|关键词>
     根据标题、作者、内容搜索包含指定关键字或者关键词的新闻。
     比如：news search title 转世系统 ----将返回所有标题中包
           含“转世系统”的新闻。


总站的巫师可以通过news post <标题>来发布新闻。news discard来
删除新闻。
HELP );
    return 1;
}
