/* 專門處理地圖上的build
   Write by -Acme- 2009.03.24
*/

//#define BUILD_FOLDER "builds"
#define BUILD_FILE_PATH "/world/builds/"

mapping builds = ([]);
int buildCount = 0;

mapping getBuilds()
{
    return builds;
}

private int isBuildExist(string file)
{
    if (undefinedp(builds[file]))
        return 0;
    else
        return 1;
}

// 取得build完整資料(mapping)
mapping getBuild(string file)
{
    if (!isBuildExist(file))
        return 0;
    if (!mapp(builds[file]))
        return 0;
    return builds[file];
}

void setBuildTitle(string file, int index, string title)
{
    int shiftX, shiftY;
    string temp, buildFile;

    if (!isBuildExist(file))
        return;
    title = ansi(title);
    if (strlen(remove_ansi(title)) > 2)
        return;

    buildFile = BUILD_FILE_PATH + builds[file]["style"] + ".c";
    if (index <= 0)
        return;
    if (index > buildFile->getTitleLength())
        return;

    temp = buildFile->getTitlePosition(index);
    if (sscanf(temp, "(%d,%d)", shiftX, shiftY) != 2)
        return;
    this_object()->set_data(builds[file]["x"] + shiftX, builds[file]["y"] + shiftY, "icon", title);

    this_object()->save();
}

void setBuildOwner(string file, string id)
{
    if (!isBuildExist(file))
        return;
    builds[file]["owner"] = id;
}

// 取得區域的folder path
private string getAreaFolderPath()
{
    int i;
    string path;

    path = file_name(this_object());
    i = strsrch(path, "/", -1);

    if (i == -1)
        return 0;

    return path[0..i];
}

// 取得區域中build的folder path
string getBuildFolderPath()
{
    int i;
    string path, filename;
    if (!(path = getAreaFolderPath()))
        return 0;

    filename = file_name(this_object());
    i = strsrch(path, "/", -1);
    if (i == -1)
        return 0;

    path = path + filename[i + 1..strlen(filename)] + "/";
    return path;
}

// 從座標取得build的file
string getBuildFile(int x, int y)
{
    string buildFile;
    if (!(buildFile = this_object()->query_data(x, y, "_BUILDING_FILE_")))
        return 0;
    if (undefinedp(builds[buildFile]))
        return 0;
    return buildFile;
}

// 檢查座標是否有building
int hasBuilding(int x, int y)
{
    string buildFile;
    if (!(buildFile = this_object()->query_data(x, y, "_BUILDING_FILE_")))
        return 0;
    if (undefinedp(builds[buildFile]))
        return 0;
    return 1;
}

// 從座標取得build的owner
string getOwner(int x, int y)
{
    string buildFile;
    if (!(buildFile = this_object()->query_data(x, y, "_BUILDING_FILE_")))
        return 0;
    if (undefinedp(builds[buildFile]))
        return 0;
    return builds[buildFile]["owner"];
}

private int isBuilding(int x, int y, string *checkPoints)
{
    int i, j, xMax, yMax;

    yMax = sizeof(checkPoints);
    for (i = 0; i < yMax; i++)
    {
        xMax = strlen(checkPoints[i]);
        for (j = 0; j < xMax; j++)
        {
            if (checkPoints[i][j..j] == "0")
                continue;

            // 沒有設 _BUILDING_
            if (!this_object()->query_data(x + j, y + i, "_BUILDING_"))
                return 0;

            // Block
            if (this_object()->query_data(x + j, y + i, "block"))
                return 0;

            // 被佔領
            if (hasBuilding(x + j, y + i))
                return 0;
        }
    }

    return 1;
}

private void toOccupy(int x, int y, string *occupy, string fileName)
{
    int i, j, xMax, yMax;

    yMax = sizeof(occupy);
    for (i = 0; i < yMax; i++)
    {
        xMax = strlen(occupy[i]);
        for (j = 0; j < xMax; j++)
        {
            if (occupy[i][j..j] == "0")
                continue;
            if (stringp(fileName))
            {
                this_object()->set_data(x + j, y + i, "_BUILDING_FILE_", fileName);
            }
            else
            {
                this_object()->delete_data(x + j, y + i, "_BUILDING_FILE_");
            }
        }
    }
}

private void setStyle(int x, int y, mapping icon)
{
    int i, j, style_size;
    string *style_key, *style_value;

    style_key = keys(icon);
    style_size = sizeof(style_key);
    for (i = 0; i < style_size; i++)
    {
        style_value = icon[i];
        for (j = 0; j < sizeof(style_value); j++)
        {
            this_object()->set_data(x + j, y + i, "icon", style_value[j]);
        }
    }
}

private void setWall(int x, int y, string *wall, int on)
{
    int i, j, xMax, yMax;

    yMax = sizeof(wall);
    for (i = 0; i < yMax; i++)
    {
        xMax = strlen(wall[i]);
        for (j = 0; j < xMax; j++)
        {
            if (wall[i][j..j] == "0")
                continue;
            if (!on)
                this_object()->delete_data(x + j, y + i, "block");
            else
                this_object()->set_data(x + j, y + i, "block", on);
        }
    }
}

// create the building as room style
private object createRoomBuilding(int x, int y, string buildFile, string filePath, string fileName)
{
    int i, exitX, exitY, exits_size;
    string code, temp, *exits_key;
    mapping exits, shift_exits;
    object build;

    code = BUILDING_D->getRoomCode();

    // write file
    if (!write_file(filePath + fileName, code))
        return 0;
    if (!objectp(build = load_object(filePath + fileName)))
        return 0;

    exits = buildFile->getExitPosition();
    exits_key = keys(exits);
    exits_size = sizeof(exits_key);
    shift_exits = ([]);

    for (i = 0; i < exits_size; i++)
    {
        temp = exits[exits_key[i]];
        if (sscanf(temp, "(%d,%d)", exitX, exitY) != 2)
            continue;

        // setup build exits
        shift_exits[exits_key[i]] = ([]);
        shift_exits[exits_key[i]]["filename"] = file_name(this_object()) + ".c";
        shift_exits[exits_key[i]]["x_axis"] = x + exitX;
        shift_exits[exits_key[i]]["y_axis"] = y + exitY;

        // setup area entry
        this_object()->set_data(x + exitX, y + exitY, "room_exit", filePath + fileName);
    }
    build->set("exits", shift_exits);

    return build;
}

// create the building as area style
private object createAreaBuilding(int x, int y, string buildFile, string filePath, string fileName)
{
    int i, j, entryX, entryY, exitX, exitY, exits_size;
    string code, temp, *exits_key;
    mapping exits;
    object build;

    temp = buildFile->getAreaSize();
    if (sscanf(temp, "(%d,%d)", exitX, exitY) != 2)
        return 0;

    code = BUILDING_D->getAreaCode(exitX, exitY);

    // write file
    if (!write_file(filePath + fileName, code))
        return 0;
    if (!objectp(build = load_object(filePath + fileName)))
        return 0;

    exits = buildFile->getExitPosition();
    exits_key = keys(exits);
    exits_size = sizeof(exits_key);

    for (i = 0; i < exits_size; i++)
    {
        temp = exits_key[i];
        if (sscanf(temp, "(%d,%d)", entryX, entryY) != 2)
            continue;

        temp = exits[exits_key[i]];
        if (sscanf(temp, "(%d,%d)", exitX, exitY) != 2)
            continue;

        // setup build exits
        build->set_area_exit(entryX, entryY, file_name(this_object()) + ".c", x + exitX, y + exitY);

        // setup area entry
        this_object()->set_area_exit(x + exitX, y + exitY, file_name(build) + ".c", entryX, entryY);
    }

    exits_key = buildFile->getBuilding();
    exits_size = sizeof(exits_key);
    for (i = 0; i < exits_size; i++)
    {
        for (j = 0; j < strlen(exits_key[i]); j++)
        {
            if (exits_key[i][j..j] == "0")
                continue;
            build->set_data(j, i, "_BUILDING_", 1);
        }
    }

    return build;
}

int createBuilding(string style, string owner, int x, int y)
{
    int checkX, checkY;
    string buildFile, temp;
    string filePath, fileName;
    object build;

    // 取得 buildFile 檔
    buildFile = BUILD_FILE_PATH + style + ".c";
    if (file_size(buildFile) == -1)
        return 0;

    // 是一個area build
    if (this_object()->isBuild() && buildFile->isAreaBuilding())
        return 0;

    // 檢查能否建立build
    temp = buildFile->getCheckPointsPosition();
    if (sscanf(temp, "(%d,%d)", checkX, checkY) != 2)
        return 0;
    checkX += x;
    checkY += y;
    if (!isBuilding(checkX, checkY, buildFile->getCheckPoints()))
        return 0;

    // get file path
    if (!(filePath = getBuildFolderPath()))
        return 0;

    // mkdir, if dir not exist
    if (file_size(filePath) == -1)
        if (!mkdir(filePath))
            return 0;

    // get file name
    fileName = "building" + buildCount + ".c";

    if (buildFile->isRoomBuilding())
    {
        build = createRoomBuilding(checkX, checkY, buildFile, filePath, fileName);
    }
    else if (buildFile->isAreaBuilding())
    {
        build = createAreaBuilding(checkX, checkY, buildFile, filePath, fileName);
    }

    if (!objectp(build))
        return 0;
    buildCount++;

    // build可以自訂建好後的設定
    buildFile->postCondition(build);
    build->set("owner", owner);
    build->save();

    // 設定build的position(左上)
    builds[fileName] = ([]);
    builds[fileName]["x"] = checkX;
    builds[fileName]["y"] = checkY;

    builds[fileName]["style"] = style;
    builds[fileName]["owner"] = owner;

    // 設定佔領
    toOccupy(checkX, checkY, buildFile->toOccupy(), fileName);

    // 設定icon
    setStyle(checkX, checkY, buildFile->getStyle(1));

    // 設定牆
    setWall(checkX, checkY, buildFile->getWall(), 1);

    this_object()->save();

    return 1;
}

private void removeEntry(int x, int y, string buildFile)
{
    if (buildFile->isRoomBuilding())
    {
        int i, exitX, exitY, exits_size;
        string *exits_key, temp;
        mapping exits;

        exits = buildFile->getExitPosition();
        exits_key = keys(exits);
        exits_size = sizeof(exits_key);

        for (i = 0; i < exits_size; i++)
        {
            temp = exits[exits_key[i]];
            if (sscanf(temp, "(%d,%d)", exitX, exitY) != 2)
                continue;
            this_object()->delete_data(x + exitX, y + exitY, "room_exit");
        }
    }
    else if (buildFile->isAreaBuilding())
    {
        int i, exitX, exitY, exits_size;
        string *exits_key, temp;
        mapping exits;

        exits = buildFile->getExitPosition();
        exits_key = keys(exits);
        exits_size = sizeof(exits_key);

        for (i = 0; i < exits_size; i++)
        {
            temp = exits[exits_key[i]];
            if (sscanf(temp, "(%d,%d)", exitX, exitY) != 2)
                continue;

            // remove area entry
            this_object()->delete_data(x + exitX, y + exitY, "area_exit");
        }
    }
}

private void rmfile(string fileName)
{
    // rm .c
    rm(fileName);

    // rm .o file
    fileName = fileName[0..strlen(fileName)-2] + "o";
    rm(fileName);
}

// 摧毀building
int destBuilding(int x, int y)
{
    string fileName, buildFile;

    // 沒被佔領
    if (!hasBuilding(x, y))
        return 0;

    if (!(fileName = getBuildFile(x, y)))
        return 0;

    // if build file not exist
    buildFile = BUILD_FILE_PATH + builds[fileName]["style"] + ".c";
    if (file_size(buildFile) == -1)
        return 0;

    // 先清空area building裡的東西
    if (buildFile->isAreaBuilding())
    {
        int i, builds_size;
        object build;
        mapping builds;
        string *builds_key, filepath;

        build = load_object(getBuildFolderPath() + fileName);
        if (!objectp(build))
            return 0;

        builds = build->getBuilds();
        if (!mapp(builds))
            return 0;

        builds_key = keys(builds);
        builds_size = sizeof(builds_key);

        filepath = build->getBuildFolderPath();
        for (i = 0; i < builds_size; i++)
            rmfile(filepath + builds_key[i]);
        rmdir(filepath);
    }

    // 移掉佔領
    toOccupy(builds[fileName]["x"], builds[fileName]["y"], buildFile->toOccupy(), 0);

    // 移掉icon
    setStyle(builds[fileName]["x"], builds[fileName]["y"], buildFile->getStyle(0));

    // 移掉牆
    setWall(builds[fileName]["x"], builds[fileName]["y"], buildFile->getWall(), 0);

    // 移掉入口
    removeEntry(builds[fileName]["x"], builds[fileName]["y"], buildFile);

    this_object()->save();

    // delete mapping info
    map_delete(builds, fileName);

    fileName = getBuildFolderPath() + fileName;
    rmfile(fileName);

    return 1;
}
